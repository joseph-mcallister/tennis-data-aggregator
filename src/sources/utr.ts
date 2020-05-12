import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import { UTRProfile } from '../models/UTRProfile';

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

		// do not insert new data for pre-existing profiles
		const existingProfiles = await UTRProfile.findAll({
			where: {
				id: responseProfiles.map(p => p.id)
			}
		});
		const existingIds = existingProfiles.map(p => p.id);
		const newProfileData = responseProfiles.filter(p => !existingIds.includes(p.id));

		// all UTRProfiles must have associated Players, so create those first
		const newPlayers = await Player.bulkCreate(
			newProfileData.map(p => ({
				name: p.displayName,
				utrProfileId: null // will set after creating new profiles
			}))
		);

		const zipped = newPlayers.map((player, i) => [player, newProfileData[i]] as const);

		await UTRProfile.bulkCreate(
			zipped.map(([player, profile]) => ({
				id: profile.id,
				singlesRating: profile.singlesUtr,
				playerId: player.id
			}))
		);

		await Player.bulkCreate(
			zipped.map(([player, profile]) => ({
				id: player.id,
				utrProfileId: profile.id
			})),
			{ updateOnDuplicate: ["utrProfileId"] } // turns into a bulk update
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
