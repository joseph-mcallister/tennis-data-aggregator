import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import assert from 'assert';
import puppeteer from 'puppeteer';

export class TR {
	browser: puppeteer.Browser;

	homepage = 'https://www.tennisrecruiting.net';
	classListUrls = [
		'https://www.tennisrecruiting.net/list.asp?id=1236&order=rank&page=1', // Class of 2023
		'https://www.tennisrecruiting.net/list.asp?id=1226' // Class of 2022
	];
	playerPageUrl = 'https://www.tennisrecruiting.net/player.asp?id=806092';

	private async _setup() {
		this.browser = await puppeteer.launch();
	}

	private async _signIn() {
		const page = await this.browser.newPage();
		await page.goto(this.homepage);
		await page.screenshot({ path: 'homepage.png' });
	}

	async getTop200(listUrl: string) {
		await this._setup();
		await this._signIn();
		console.log(listUrl);
	}
}

export interface TRResponse {}
