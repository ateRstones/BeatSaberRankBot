const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'pp-diff',
	description: 'Gibt die PP Differenz zwischen dir und einem anderem Spieler.',
	args: true,
	usage: "<global-rank>",
	async execute(message, args) {

		// If user is in database, return associated Scoresaber profile
		const commandUserScoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (commandUserScoresaber == null) {
			message.channel.send('Du bist nicht in der Datenbank.');
			return;
		}

		const commandUserData = await scraper.getPlayerData(commandUserScoresaber);
		const commandUserPP = commandUserData[3];
		let targetUserScoresaber;

		// TypeError: Cannot read property 'toLowerCase' of undefined
		const arg = args[0].toLowerCase().replace(',', '');

		const startOfId = arg.indexOf('/u/');
		// If given a Scoresaber profile
		if (startOfId !== -1) {

			targetUserScoresaber = arg.slice(startOfId);

			// Remove any sorts (ie page or recent) from the string
			const endOfId = targetUserScoresaber.indexOf('&');
			if (endOfId !== -1) {
				targetUserScoresaber = targetUserScoresaber.slice(0, endOfId);
			}
		} else {
			// If only a number
			if (arg.replace(/[0-9]/g, '').length === 0) {
				targetUserScoresaber = await scraper.getPlayerAtRank(parseInt(arg, 10));

			// If two letters in argument
			} else if (arg.replace(/[0-9]/g, '').length === 2) {
				const region = arg.replace(/[0-9]/g, '');
				const regionIndex = arg.indexOf(region);
				// Check if both characters are together
				if (regionIndex === -1) {
					message.channel.send('Bitte gib ein Scoresaber Profil oder Rang');
					return;
				}
				// Check if characters have no following numbers
				if (arg.slice(regionIndex).length !== 2) {
					message.channel.send('Bitte gib ein Scoresaber Profil oder Rang');
					return;
				}
				const rank = parseInt(arg.replace(/\D/g, ''));
				targetUserScoresaber = await scraper.getPlayerAtRank(rank, region);

			} else {
				message.channel.send('Bitte gib ein Scoresaber Profil oder Rang');
				return;
			}

			if (!targetUserScoresaber) {
				message.channel.send('Ein Spieler mit dem Rang existiert nicht.');
				return;
			}
		}

		if (targetUserScoresaber === commandUserScoresaber) {
			// PUT HEAD EMOTE IN HERE
			message.channel.send('<:waliwut:583036992158171156>');
			return;
		}

		const targetUserData = await scraper.getPlayerData(targetUserScoresaber);
		const targetUserPP = targetUserData[3];
		const targetUserName = targetUserData[4];

		const PPDiff = Math.abs(targetUserPP - commandUserPP).toFixed(2);

		if (targetUserPP > commandUserPP) {
			message.channel.send(`${targetUserName} hat ${PPDiff}PP mehr als du.`);
		} else if (targetUserPP < commandUserPP) {
			message.channel.send(`Du hast ${PPDiff}PP mehr als ${targetUserName}`);
		} else {
			message.channel.send(`Du hast genau so viel PP wie ${targetUserName}.`);
		}
	},
};