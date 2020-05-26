import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import assert from 'assert';
import { Op } from 'sequelize';

export class ITF {

	async searchBirthDays() {
        console.log("searching birth days")
        const missingGradYear: Player[] = await Player.findAll({
            where: { 
                gradYear: {
                    [Op.eq]: null
                }
            }
        });
        for (const player of missingGradYear) {
            const res = await axios.get('https://www.itftennis.com/Umbraco/Api/PlayerApi/GetPlayerSearch?searchString=lev%20kazakov')
            console.log(res.data);
            // ROBOTS file causing problems...need to use cheerio
        }
    }
    
}

export interface ITFResponse {
	
}
