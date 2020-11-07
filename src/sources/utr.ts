import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import { UTREntry } from '../models/UTREntry';
import assert from 'assert';
import { UniqueConstraintError } from 'sequelize';

export class UTR {
	private jwt: string | null = null;

	async login() {
		const res = await axios.post('https://app.myutr.com/api/v1/auth/login', config.utr);

		this.jwt = res.headers['jwt-token'];
	}

	get headers() {
		if (!this.jwt) {
			throw new Error('Not logged in');
		}

		return {
			Cookie: `jwt=${this.jwt}`
		};
	}

	async fetchPlayers(minUtr: number, maxUtr: number, step = 0.02, primaryTags = `Junior`) {
		const results: UTRSource[] = [];
		for (let currMin = minUtr; currMin + step < maxUtr; currMin += step) {
			console.log({ currMin, currMax: currMin + step });
			const res = await axios.get<UTRResponse>(
				'https://agw-prod.myutr.com/v2/search/players' +
					`?top=100&skip=0&gender=M&primaryTags=${primaryTags}&utrMin=${currMin}&utrMax=${
						currMin + step
					}&utrType=verified&utrTeamType=singles`,
				{ headers: this.headers }
			);
			res.data.hits.forEach(hit => {
				results.push(hit.source);
			});
		}
		return results;
	}

	async syncTopPlayers() {
		const minUtr = 11.0;
		const maxUtr = 13.0;
		const step = 0.02;
		for (let currMin = minUtr; currMin + step < maxUtr; currMin += step) {
			console.log({ currMin, currMax: currMin + step });
			const res = await axios.get<UTRResponse>(
				'https://agw-prod.myutr.com/v2/search/players' +
					`?top=100&skip=0&gender=M&primaryTags=Junior&utrMin=${currMin}&utrMax=${
						currMin + step
					}&utrType=verified&utrTeamType=singles`,
				{ headers: this.headers }
			);

			assert(res.data.total <= 100); // UTR limits all responses on search queries to at most 100 players
			const responseProfiles = res.data.hits.map(h => h.source);

			const profileIds = responseProfiles.map(p => p.id);

			// find all players that already exist
			const existingPlayers = await Player.findAll({
				where: {
					utrProfileId: profileIds
				}
			});

			const newPlayers = await Player.bulkCreate(
				responseProfiles.map(p => ({
					name: p.displayName,
					utrProfileId: p.id,
					gradClassName: p.playerHighSchoolDetails?.gradClassName,
					gradYear: p.playerHighSchoolDetails?.gradYear,
					latitude: p.location?.latLng?.[0],
					longitude: p.location?.latLng?.[1],
					location: p.location?.display
				})),
				// adds `ON CONFLICT DO NOTHING` to the query
				// because UTR ids are unique, only creates new players if they don't exist
				{ ignoreDuplicates: true }
			).catch(err => {
				if (err instanceof UniqueConstraintError) {
					console.log(err.errors);
				}
				throw err;
			});

			const allPlayers = existingPlayers.concat(newPlayers);

			// save all the entries
			await UTREntry.bulkCreate(
				responseProfiles.map(p => ({
					playerId: allPlayers.find(pl => pl.utrProfileId === p.id)!.id,
					utrProfileId: p.id,
					singlesRating: p.myUtrSingles,
					doublesRating: p.myUtrDoubles
				}))
			);
		}
	}
}

interface UTRSource {
	id: number;
	displayName: string;
	myUtrSingles: number;
	myUtrDoubles: number;
	location: {
		display: string; // never null, just empty string
		latLng: number[] | null;
	} | null;
	playerHighSchoolDetails: {
		gradClassName: string;
		gradYear: Date;
	} | null;
}
export interface UTRResponse {
	total: number;
	totalAllowed: number;
	hits: Array<{
		source: UTRSource;
	}>;
}
