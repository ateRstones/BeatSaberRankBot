const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'amr',
	description: 'Gibt die PP Differenz zu anderen Spieler aus deiner Region um deinen Rank herum',
	args: false,
	guildOnly: true,
	async execute(message) {
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
		const commandUserRegionalRank = commandUserData[0];
		const commandUserRegion = commandUserData[1].toLowerCase();
		let commandUserName = commandUserData[4];

		const lowerPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRegionalRank + 1, commandUserRegion);
		const lowerPlayerData = await scraper.getPlayerData(lowerPlayerScoresaber);
		const lowerPlayerPP = lowerPlayerData[3];
		const lowerPlayerRegionalRank = lowerPlayerData[0];
		const lowerPlayerName = lowerPlayerData[4];

		if (commandUserRegionalRank === 1) {
			message.channel.send(`Du bist ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP über ${lowerPlayerName}`);
			return;
		}

		const higherPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRegionalRank - 1, commandUserRegion);
		const higherPlayerData = await scraper.getPlayerData(higherPlayerScoresaber);
		const higherPlayerPP = higherPlayerData[3];
		const higherPlayerRegionalRank = higherPlayerData[0];
		const higherPlayerName = higherPlayerData[4];


		if (commandUserName === 'Alppuccino') {
			commandUserName = 'Al-PooPoo-Ccino';
		}

		message.channel.send(`__**${commandUserRegion.toUpperCase()} Ränge um dich herum:**__\n#${higherPlayerRegionalRank} **${higherPlayerName}** hat ${(higherPlayerPP - commandUserPP).toFixed(2)}PP mehr als du.\n#${commandUserRegionalRank} **Du (${commandUserName})** hast ${commandUserPP}PP.\n#${lowerPlayerRegionalRank} **${lowerPlayerName}** hat ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP weniger als du.`);
	},
};