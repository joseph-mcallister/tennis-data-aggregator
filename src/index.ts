import { Sequelize } from 'sequelize-typescript';
import config from './config';
import { UTR } from './sources/utr';

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
	await sequelize.sync();

	const utr = new UTR();
	await utr.login();
	await utr.syncTopPlayers();
})();
