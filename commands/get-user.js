const database = require('../config.json').database;
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'get-user',
	description: 'Gibt den zugehörigen User, wenn er in den Datenbank ist.',
	args: true,
	usage: '<scoresaber profil>/<user>',
	staffOnly: true,
	async execute(message, args, updater, server, client) {

		// If no user mentioned
		if (!message.mentions.users.size) {
			const arg = args[0];

			const startOfId = arg.indexOf('/u/');
			// If given a Scoresaber profile
			if (startOfId !== -1) {

				let scoresaber = arg.slice(startOfId);

				// Remove any sorts (ie page or recent) from the string
				const endOfId = scoresaber.indexOf('&');
				if (endOfId !== -1) {
					scoresaber = scoresaber.slice(0, endOfId);
				}

				// If Scoresaber profile is in database, return associated discord user
				const discordId = await db1.get(scoresaber).catch(err => {
					console.log(err);
				});
				if (discordId !== undefined) {
					const user = await client.fetchUser(discordId);

					if (user === undefined) message.channel.send('ERROR: fetchUser returned undefined');

					message.channel.send(`${user.tag} (id ${discordId})`);
				} else {
					message.channel.send('Das Profil ist nicht in der Datenbank.');
				}

			// Not given Scoresaber profile
			} else {
				let userId;
				// Check if given user id
				try {
					await client.fetchUser(arg);
					userId = arg;
				} catch(err) {
					message.channel.send('Bitte gebe ein valides Scoresaber-Profil an.');
					return;
				}

				// This check is probably pointless as I think this point is unreachable with undefined userId
				if (userId === undefined) {
					message.channel.send('Bitte gebe ein valides Scoresaber-Profil / User an.');
				}

				// If user is in database, return associated Scoresaber profile
				const scoresaber = await db2.get(userId).catch(err => {
					console.log(err);
				});

				if (scoresaber !== undefined) {
					message.channel.send(`https://scoresaber.com${scoresaber}`);
				} else {
					message.channel.send('Der User ist nicht in der Datenbank.');
				}
			}

		// User mentioned
		} else {
			const userId = message.mentions.users.first().id;

			// If user is in database, return associated Scoresaber profile
			const scoresaber = await db2.get(userId).catch(err => {
				console.log(err);
			});

			if (scoresaber !== undefined) {
				message.channel.send(`https://scoresaber.com${scoresaber}`);
			} else {
				message.channel.send('Der User ist nicht in der Datenbank.');
			}

		}
	},
};