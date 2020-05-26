import { Sequelize } from 'sequelize-typescript';
import config from './config';
import { UTR } from './sources/utr';
import { ITF } from './sources/itf';

// TODO: Secrets, DB auth

const sequelize = new Sequelize({
	dialect: 'postgres', // Aurora is both MySQL- and Postgres-compatible
	...config.dbConnection,
	models: [__dirname + '/models']
});

// Default Lambda handler is `index.handler`
export function handler() {
	console.log("Hello, world!");
}

(async () => {
	await sequelize.authenticate();
	console.log('authenticated');
	await sequelize.sync({ force: true });


	/** Universal Tennis Rating (UTR) */
	const utr = new UTR();
	await utr.login();
	await utr.syncTopPlayers();

	/** International Tennis Federation (ITF) */
	const itf = new ITF();
	await itf.searchBirthDays();
})();
