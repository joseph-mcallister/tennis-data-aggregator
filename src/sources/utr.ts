import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import { UTREntry } from '../models/UTREntry';
import { totalmem } from 'os';
import assert from 'assert';

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

	async syncTopPlayers() {
		const minUtr = 11.0;
		const maxUtr = 13.0;
		const step = 0.02;
		for (let currMin = minUtr; currMin + step < maxUtr; currMin += step) {

			console.log({currMin, currMax: currMin + step});
			const res = await axios.get<UTRResponse>(
				'https://agw-prod.myutr.com/v2/search/players' +
					`?top=100&skip=0&gender=M&primaryTags=Junior&utrMin=${currMin}&utrMax=${currMin + step}&utrType=verified&utrTeamType=singles`,
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
			const existingPlayerIds = existingPlayers.map(p => p.id);

			// create new players if there aren't any associated with the given UTR profile
			const newPlayers = await Player.bulkCreate(
				responseProfiles
					.filter(p => !existingPlayerIds.includes(p.id))
					.map(p => ({ 
						name: p.displayName, 
						utrProfileId: p.id, 
						gradClassName: p.playerHighSchoolDetails ? p.playerHighSchoolDetails.gradClassName : null, 
						gradYear: p.playerHighSchoolDetails ? p.playerHighSchoolDetails.gradYear : null,
						latitude: p.location && p.location.latLng ? p.location.latLng[0]: null,
						longitude: p.location && p.location.latLng ? p.location.latLng[1]: null,
						location: p.location && p.location.display ? p.location.display : null
					}))
			);

			const allPlayers = existingPlayers.concat(newPlayers);

			// save all the entries
			await UTREntry.bulkCreate(
				responseProfiles.map(p => ({
					playerId: allPlayers.find(pl => pl.utrProfileId === p.id)!.id,
					utrId: p.id,
					singlesRating: p.myUtrSingles,
					doublesRating: p.myUtrDoubles
				}))
			);
		}
	}
}

export interface UTRResponse {
	total: number;
	totalAllowed: number;
	hits: Array<{
		source: {
			id: number;
			displayName: string;
			myUtrSingles: number;
			myUtrDoubles: number;
			location: {
				display: string;
				latLng: number[];
			};
			playerHighSchoolDetails: {
				gradClassName: string;
				gradYear: Date;
			};
		};
	}>;
}
