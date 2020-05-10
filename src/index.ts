import { Sequelize } from 'sequelize-typescript';

// TODO: Secrets, DB auth

const sequelize = new Sequelize({
	dialect: 'postgres', // Aurora is both MySQL- and Postgres-compatible
	models: [__dirname + '/models']
});

// Default Lambda handler is `index.handler`
export function handler() {
	console.log("Hello, world!");
}
