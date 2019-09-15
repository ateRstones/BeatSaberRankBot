const scraper = require('../scraper.js');
const database = require('../config.json').database;
const numPlayersToScrape = require('../config.json').numPlayersToScrape;
const customRegionName = require('../config.json').customRegionName;
const scoresaberRegion = require('../config.json').scoresaberRegion;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'amrs',
	description: 'Gibt die PP Differenz zu anderen Spieler aus der Region des Servers um deinen Rank herum.',
	args: false,
	guildOnly: true,
	async execute(message, args, updater, server, client, regionalPlayers) {
		// If user is in database, return associated Scoresaber profile
		const commandUserScoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (commandUserScoresaber == null) {
			message.channel.send('Du bist nicht in der Datenbank.');
			return;
		}

		// TODO Add multiregion support (DE CH A)
		let regionName;
		if (customRegionName !== '') {
			regionName = customRegionName;
		} else {
			regionName = scoresaberRegion;
		}

		if (regionalPlayers.indexOf(commandUserScoresaber) === -1) {
			message.channel.send(`Du bist nicht in den Top ${numPlayersToScrape} ${regionName.toUpperCase()}`);
			return;
		}

		const commandUserData = await scraper.getPlayerData(commandUserScoresaber);
		const commandUserPP = commandUserData[3];
		const commandUserRegionalRank = regionalPlayers.indexOf(commandUserScoresaber) + 1;
		let commandUserName = commandUserData[4];

		const lowerPlayerScoresaber = regionalPlayers[commandUserRegionalRank];
		const lowerPlayerData = await scraper.getPlayerData(lowerPlayerScoresaber);
		const lowerPlayerPP = lowerPlayerData[3];
		const lowerPlayerRegionalRank = commandUserRegionalRank + 1;
		const lowerPlayerName = lowerPlayerData[4];

		if (commandUserRegionalRank === 1) {
			message.channel.send(`Du bist ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP über ${lowerPlayerName}`);
			return;
		}

		const higherPlayerScoresaber = regionalPlayers[commandUserRegionalRank - 2];
		const higherPlayerData = await scraper.getPlayerData(higherPlayerScoresaber);
		const higherPlayerPP = higherPlayerData[3];
		const higherPlayerRegionalRank = commandUserRegionalRank - 1;
		const higherPlayerName = higherPlayerData[4];


		if (commandUserName === 'Alppuccino') {
			commandUserName = 'Al-PooPoo-Ccino';
		}

		message.channel.send(`__**${regionName.toUpperCase()} Ränge um dich herum:**__\n#${higherPlayerRegionalRank} **${higherPlayerName}** hat ${(higherPlayerPP - commandUserPP).toFixed(2)}PP mehr als du.\n#${commandUserRegionalRank} **Du (${commandUserName})** hast ${commandUserPP}PP.\n#${lowerPlayerRegionalRank} **${lowerPlayerName}** hat ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP weniger als du.`);
	},
};