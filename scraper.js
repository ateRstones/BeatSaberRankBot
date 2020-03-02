const scoresaberRegion = require('./config.json').scoresaberRegion;
const numPlayersToScrape = require('./config.json').numPlayersToScrape;
const rp = require('request-promise');
const $ = require('cheerio');

//https://regex101.com
const ppMatch = /<li><strong>Performance Points:<\/strong> ([0-9,\.]+)pp<\/li>/
const globalRankMatch = /<a href="\/global">#([\d,]+)<\/a>/
const regionMatch = /<a href="\/global\?country=([^"]+)"><img src=\"\/imports\/images\/flags\/[^"]*.png" \/> #([\d,]+)<\/a>/
const nameMatch = /meta property="og:title" content="(.+)'s profile" \/>/

module.exports = {

	async getPlayers() {
		try {
			const pagesToScrape = Math.ceil(numPlayersToScrape / 50);
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const url = 'https://scoresaber.com/global/' + (i + 1) + `&country=${scoresaberRegion}`;
				await rp(url)
					.then(html => {
						const rows = $('tr', html);
						rows.each(function(n) {
							if(n !== 0) {
								players[50 * i + n - 1] = $('a', this).attr('href');
							}
						});
					})
					.catch(err => {
						console.log(err);
					});
			}
			return players;
		} catch (e) {
			console.log(e);
			throw e;
		}
	},

	async getTopGlobalPlayers() {
		try {
			const pagesToScrape = 4;
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const url = 'https://scoresaber.com/global/' + (i + 1);
				await rp(url)
					.then(html => {
						const rows = $('tr', html);
						rows.each(function(n) {
							if(n !== 0) {
								players[50 * i + n - 1] = $('a', this).attr('href');
							}
						});
					})
					.catch(err => {
						console.log(err);
					});
			}
			return players;
		} catch (e) {
			console.log(e);
			throw e;
		}
	},

	async getRegion(scoresaber) {
		const url = 'https://scoresaber.com' + scoresaber;
		let region;
		await rp(url)
			.then(html => {
				const ul = $('ul', html).slice(0, 1);
				const li = $('li', ul).slice(0, 1);
				const links = $('a', li);
				const regionLink = links.slice(-1).attr('href');
				region = regionLink.slice(-2);
			})
			.catch(err => {
				console.log(err);
			});
		return region;
	},

	async getPlayerData(scoresaber) {
        const url = 'https://scoresaber.com' + scoresaber;
        let regionRank;
        let region;
        let globalRank;
        let pp;
        let name;
        await rp(url)
            .then(html => {
				globalRank = parseInt(globalRankMatch.exec(html)[1].replace(",", ""))
				let regionRes = regionMatch.exec(html)
				regionRank = parseInt(regionRes[2].replace(",", ""))
				region = regionRes[1]
				pp = ppMatch.exec(html)[1]
				pp = parseFloat(pp.replace(',', '').replace('pp', ''));
				name = nameMatch.exec(html)[1]
            })
            .catch(err => {
                console.log(err);
            });
        return [regionRank, region, globalRank, pp, name];
    },

	async getPlayerAtRank(rank, region = false) {
		let pageToScrape = Math.ceil(rank / 50);
		if (rank % 50 === 0) {
			pageToScrape = Math.ceil((rank - 1) / 50);
		}
		let player;
		let url;
		if (!region) {
			url = 'https://scoresaber.com/global/' + (pageToScrape);
		} else {
			url = 'https://scoresaber.com/global/' + (pageToScrape) + `&country=${region}`;
		}
		await rp(url)
			.then(html => {
				const rows = $('tr', html);

				let playerRowNum;
				if (rank % 50 === 0) {
					playerRowNum = 50;
				} else {
					playerRowNum = rank % 50;
				}

				if (rows.length - 1 < playerRowNum) {
					player = false;
					return;
				}

				rows.each(function(n) {
					if(n === playerRowNum) {
						player = $('a', this).attr('href');
					}
				});
			})
			.catch(err => {
				console.log(err);
			});
		return player;
	}
};