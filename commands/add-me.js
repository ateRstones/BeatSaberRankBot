const database = require('../config.json').database;
const addRegionRole = require('../roleUpdater').addRegionRole;
const addRankRole = require('../roleUpdater').addRankRole;
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'add-me',
	description: 'Fügt einen User und dessen Scoresaber-Profil zur Datenbank hinzu',
	args: true,
	guildOnly: true,
	usage: '<Scoresaber Profil>',
	async execute(message, args, updater, server) {

		const userId = message.author.id;
		let scoresaber = args[0];

		// Reject command if arg doesn't contain /u/ and remove anything before it
		const startOfId = scoresaber.indexOf('/u/');
		if (startOfId !== -1) {
			scoresaber = scoresaber.slice(startOfId);
		} else {
			message.channel.send('Gib bitte ein valides Scoresaber-Profil an.');
			return;
		}

		// Remove any sorts (ie page or recent) from the string
		const endOfId = scoresaber.indexOf('&');
		if (endOfId !== -1) {
			scoresaber = scoresaber.slice(0, endOfId);
		}

		// Idiot filter
		// eslint-disable-next-line no-useless-escape
		scoresaber = scoresaber.replace(/[^a-z0-9\/:.-]/gi, '');

		// If neither the discord user or Scoresaber profile is already in the database, add them
		const lookup1 = await db1.get(scoresaber).catch(err => {
			console.log(err);
		});
		const lookup2 = await db2.get(userId).catch(err => {
			console.log(err);
		});
		if (lookup1 === undefined) {
			if (lookup2 === undefined) {
				db1.set(scoresaber, userId).then(() => {
					db2.set(userId, scoresaber).then(() => {
						message.channel.send('User hinzugefügt.');
						// Get their guildMemeber object and use it to add region and rank roles
						server.fetchMember(userId).then(guildMember => {
							addRegionRole(scoresaber, guildMember);
							addRankRole(scoresaber, guildMember);
						}).catch(err => {
							console.log(err);
						});
					}).catch(err => {
						console.log(err);
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				message.channel.send('Du bist bereits eingetragen.');
			}
		} else {
			message.channel.send('Dieses Scoresaber-Profil wurde bereits registriert.');
		}
	},
};