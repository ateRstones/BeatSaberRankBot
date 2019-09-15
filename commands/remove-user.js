const database = require('../config.json').database;
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'remove-user',
	description: 'Entfernt einen User oder Scoresaber Profil von der Datenbank',
	args: true,
	usage: '<scoresaber profile>/<user>',
	staffOnly: true,
	async execute(message, args, updater, server) {

		// If no user mentioned
		if (!message.mentions.users.size) {
			const arg = args[0];
			let scoresaber;
			let userId;

			// Reject command if arg doesn't contain /u/ and remove anything before it
			const startOfId = arg.indexOf('/u/');
			if (startOfId !== -1) {
				scoresaber = arg.slice(startOfId);
			} else {
				try {
					await db2.get(arg);
				} catch(err) {
					message.channel.send('Bitte gebe ein valides Scoresaber-Profil / User an.');
					return;
				}
				userId = arg;
			}

			// Checks if given Scoresaber profile
			if (scoresaber !== undefined) {

				// Remove any sorts (ie page or recent) from the string
				const endOfId = scoresaber.indexOf('&');
				if (endOfId !== -1) {
					scoresaber = scoresaber.slice(0, endOfId);
				}

				// If Scoresaber profile is in database, delete from both namespaces
				const discordId = await db1.get(scoresaber).catch(err => {
					console.log(err);
				});
				if (discordId !== undefined) {
					db1.delete(scoresaber).then(() => {
						db2.delete(discordId).then(() => {
							message.channel.send('User gelöscht.');
						}).catch(err => {
							console.log(err);
						});
					}).catch(err => {
						console.log(err);
					});
				} else {
					message.channel.send('Das Profil ist nicht in der Datenbank.');
				}

			// If given user id instead
			} else {
				scoresaber = await db2.get(userId).catch(err => {
					console.log(err);
				});
				if (scoresaber !== undefined) {
					db1.delete(scoresaber).then(() => {
						db2.delete(userId).then(() => {
							message.channel.send('User gelöscht.');
						}).catch(err => {
							console.log(err);
						});
					}).catch(err => {
						console.log(err);
					});
				} else {
					message.channel.send('Der User ist nicht in der Datenbank.');
				}
			}


		// User mentioned
		} else {
			const userId = message.mentions.users.first().id;
			// If discord user is in database, delete from both namespaces
			const scoresaber = await db2.get(userId).catch(err => {
				console.log(err);
			});
			if (scoresaber !== undefined) {
				db1.delete(scoresaber).then(() => {
					db2.delete(userId).then(() => {
						message.channel.send('User gelöscht.');
					}).catch(err => {
						console.log(err);
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				message.channel.send('Der User ist nicht in der Datenbank.');
			}
		}
	},
};