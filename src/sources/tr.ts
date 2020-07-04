import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import assert from 'assert';

export class TR {

    classListUrls = [
        'https://www.tennisrecruiting.net/list.asp?id=1236&order=rank&page=1', // Class of 2023
        'https://www.tennisrecruiting.net/list.asp?id=1226' // Class of 2022
    ]

    playerPageUrls = 'https://www.tennisrecruiting.net/player.asp?id=806092'

	async getTop200(listUrl: string) {
        // TODO: 
		console.log(listUrl);
    }

    
}

export interface TRResponse {
	
}
