const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'id',
	description: 'Gibt deine Scoresaber-Id.',
	args: false,
	async execute(message) {

		// If user is in database, return associated Scoresaber profile
		const scoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (scoresaber == null) {
			message.channel.send('Du bist nicht in der Datenbank.');
			return;
		}

		const scoresaberId = scoresaber.replace('/u/', '');

		message.channel.send(`Deine Scoresaber-Id ist: ${scoresaberId}`);
	},
};