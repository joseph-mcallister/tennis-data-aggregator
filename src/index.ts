import { Sequelize } from 'sequelize-typescript';
import config from './config';
import { UTR } from './sources/utr';
import { ITF } from './sources/itf';
import { TR } from './sources/tr';
import express from 'express';
import { Parser } from 'json2csv';

const app = express();
const utr = new UTR();

app.get('/health', async (req, res) => {
	console.log('recieved health check');
	return res.json(200);
});

app.get('/', async (req: express.Request, res) => {
	await utr.login();
	const startRating = parseFloat(req.query.startRating as string);
	const endRating = parseFloat(req.query.endRating as string);
	const isJsonOutput = req.query.json && req.query.json === 'true';
	const players = await utr.fetchPlayers(startRating, endRating, 0.02);
	const fields = [
		{
			label: 'displayName',
			value: 'displayName'
		},
		{
			label: 'myUtrSingles',
			value: 'myUtrSingles'
		},
		{
			label: 'myUtrDoubles',
			value: 'myUtrDoubles'
		},
		{
			label: 'GradYear',
			value: 'playerHighSchoolDetails.gradYear'
		},
		{
			label: 'location.display',
			value: 'location.display'
		}
	];
	if (isJsonOutput) {
		return res.json(players);
	}
	const json2csv = new Parser({ fields });
	const csv = json2csv.parse(players);
	res.header('Content-Type', 'text/csv');
	res.attachment(`players-${new Date().toDateString()}.csv`);
	console.log('returning csv');
	return res.send(csv);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`server started at http://localhost:${port}`);
});

// const sequelize = new Sequelize({
// 	dialect: 'postgres', // Aurora is both MySQL- and Postgres-compatible
// 	...config.dbConnection,
// 	models: [__dirname + '/models']
// });

// Default Lambda handler is `index.handler`
export function handler() {
	console.log('Hello, world!');
}

(async () => {
	// await sequelize.authenticate();
	// console.log('authenticated');
	// await sequelize.sync();
	/** Universal Tennis Rating (UTR) */
	// const utr = new UTR();
	// await utr.login();
	// await utr.syncTopPlayers();
	/** Tennis Recruiting (TR) */
	// const tr = new TR();
	// await tr.getTop200();
	/** International Tennis Federation (ITF) */
	// const itf = new ITF();
	// await itf.searchBirthDays();
})();
