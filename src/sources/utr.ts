import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import { UTREntry } from '../models/UTREntry';

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
		// TODO: Parametrize request
		const res = await axios.get<UTRResponse>(
			'https://agw-prod.myutr.com/v2/search/players' +
				'?top=100&skip=0&gender=M&primaryTags=Junior&utrMin=12.0&utrMax=13.0&utrType=verified&utrTeamType=singles',
			{ headers: this.headers }
		);

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
				.map(p => ({ name: p.displayName, utrProfileId: p.id }))
		);

		const allPlayers = existingPlayers.concat(newPlayers);

		// save all the entries
		await UTREntry.bulkCreate(
			responseProfiles.map(p => ({
				playerId: allPlayers.find(pl => pl.utrProfileId === p.id)!.id,
				utrId: p.id,
				singlesRating: p.singlesUtr
			}))
		);
	}
}

export interface UTRResponse {
	hits: Array<{
		source: {
			id: number;
			displayName: string;
			singlesUtr: number;
		};
	}>;
}
