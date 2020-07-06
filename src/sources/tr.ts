import axios from 'axios';
import config from '../config';
import { Player } from '../models/Player';
import assert from 'assert';
import puppeteer from 'puppeteer';
import { link } from 'fs';

export class TR {
	browser: puppeteer.Browser;
	page: puppeteer.Page;

	homepage = 'https://www.tennisrecruiting.net';
	classListUrls = [
		'https://www.tennisrecruiting.net/list.asp?id=1236&order=rank', // Class of 2023
		'https://www.tennisrecruiting.net/list.asp?id=1226&order=rank' // Class of 2022
	];
	playerPageUrl = 'https://www.tennisrecruiting.net/player.asp?id=806092';

	private async _setup() {
		this.browser = await puppeteer.launch({ headless: false });
	}

	private async _signIn() {
		this.page = await this.browser.newPage();
		await this.page.goto(this.homepage);

		await this.page.waitForSelector('input[name="login_username"]');
		await this.page.type('input[name="login_username"]', config.tr.username);
		await this.page.waitForSelector('input[name="login_password"]');
		await this.page.type('input[name="login_password"]', config.tr.password);
		await this.page.waitForSelector('input[name="login_btn"]');
		await this.page.click('input[name="login_btn"]');

		await this.page.screenshot({ path: 'login.png' });
	}

	/** Parses class list page to return all player id's in html table */
	private async _getPlayerIdsFromTable(): Promise<(string | undefined)[]> {
		const hrefs = await this.page.$$eval('a[href]', aTags =>
			aTags.map(a => a.getAttribute('href'))
		);
		return hrefs
			.filter(href => href?.includes('/player/activity.asp?id='))
			.map(href => href?.split('=')[1])
			.filter(href => href);
	}

	async getTop200() {
		await this._setup();
		await this._signIn();

		for (const classListUrl of this.classListUrls) {
			for (let i = 1; i <= 2; i++) {
				await this.page.goto(`${classListUrl}&page=${i}`);
				await this.page.screenshot({ path: `players-${i}.png` });
				const playerIds = await this._getPlayerIdsFromTable();
				console.log(playerIds);
			}
		}
	}
}

export interface TRResponse {}
