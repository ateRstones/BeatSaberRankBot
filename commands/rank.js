const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'rank',
	description: 'Gibt deinen Regionalen Rang.',
	args: false,
	guildOnly: true,
	staffOnly: false,
	async execute(message) {

		// If user is in database, return associated Scoresaber profile
		const scoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (scoresaber === undefined) {
			message.channel.send('Du bist nicht in der Datenbank.');
			return;
		}

		const playerData = await scraper.getPlayerData(scoresaber);

		if (message.author.id === '529664586581016606') {
			message.channel.send(`You are #${playerData[0]} ${playerData[1].toUpperCase()} (#${playerData[2]} global) but really the best player in the world :heart:`);
			return;
		}
		message.channel.send(`Du bist #${playerData[0]} ${playerData[1].toUpperCase()} (#${playerData[2]} Global)`);
	},
};