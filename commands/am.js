const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'am',
	description: 'Gibt die PP Differenz zu anderen Spieler um deinen Rank herum.',
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
		const commandUserRank = commandUserData[2];
		let commandUserName = commandUserData[4];

		const lowerPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRank + 1);
		const lowerPlayerData = await scraper.getPlayerData(lowerPlayerScoresaber);
		const lowerPlayerPP = lowerPlayerData[3];
		const lowerPlayerRank = lowerPlayerData[2];
		const lowerPlayerName = lowerPlayerData[4];

		if (commandUserRank === 1) {
			message.channel.send(`Du bist ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP über ${lowerPlayerName}`);
			return;
		}

		const higherPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRank - 1);
		const higherPlayerData = await scraper.getPlayerData(higherPlayerScoresaber);
		const higherPlayerPP = higherPlayerData[3];
		const higherPlayerRank = higherPlayerData[2];
		const higherPlayerName = higherPlayerData[4];


		if (commandUserName === 'Alppuccino') {
			commandUserName = 'Al-PooPoo-Ccino';
		}

		message.channel.send(`__**Globale Ränge um dich herum:**__\n#${higherPlayerRank} **${higherPlayerName}** hat ${(higherPlayerPP - commandUserPP).toFixed(2)}PP mehr als du.\n#${commandUserRank} **Du (${commandUserName})** hast ${commandUserPP}PP.\n#${lowerPlayerRank} **${lowerPlayerName}** hat ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP weniger als du.`);
	},
};