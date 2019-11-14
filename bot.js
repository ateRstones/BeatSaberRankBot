const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, staff, serverId, interval } = require('./config.json');
const autoUpdateInterval = interval * 60 * 1000;
const autoUpdateRoles = require('./roleUpdater').autoUpdateRoles;

const client = new Discord.Client();

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

let updater;
let server;

const regionalPlayers = [];

client.once('ready', () => {
	server = client.guilds.get(serverId);
	// Wrapper for updater
	updater = new class {
		constructor() {
			this.timeout = client.setInterval(async () => {
				autoUpdateRoles(server).then((newRegionalPlayers) => {
					for (let i = 0; i < newRegionalPlayers.length; i++) {
						regionalPlayers[i] = newRegionalPlayers[i];
					}
				});
			}, autoUpdateInterval);

			this.stopped = false;
			console.log('Updater started.');
		}
		stop() {
			this.stopped = true;
			client.clearInterval(this.timeout);
			console.log('Updater stopped.');
		}
		start() {
			if (this.stopped === true) {
				this.stopped = false;
				this.timeout = client.setInterval(async () => {
					autoUpdateRoles(server).then((newRegionalPlayers) => {
						for (let i = 0; i < newRegionalPlayers.length; i++) {
							regionalPlayers[i] = newRegionalPlayers[i];
						}
					});
				}, autoUpdateInterval);
				console.log('Updater started again.');
			}
		}
	};
	console.log('Ready!');
	autoUpdateRoles(server).then((newRegionalPlayers) => {
		for (let i = 0; i < newRegionalPlayers.length; i++) {
			regionalPlayers[i] = newRegionalPlayers[i];
		}
	});
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (command.staffOnly && !staff.includes(message.author.tag)) {
		message.reply('Dieser Command ist nur die Admins.');
		return;
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('Dieser Command ist nur auf dem Server nutzbar.');
	}

	if (message.guild !== null && message.guild.id !== serverId) {
		return message.reply('Dieser Command ist nur auf dem Server nutzbar.');
	}

	if (command.args && !args.length) {
		let reply = `Du hast keine Argumente angegeben, ${message.author}!`;

		if (command.usage) {
			reply += `\nDie korrekte Nutzung ist: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id) && !staff.includes(message.author.tag)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Bitte ${timeLeft.toFixed(1)} Sekunde(n) vor der nächsten Nutzung von \`${command.name}\` warten.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args, updater, server, client, regionalPlayers);
	} catch (error) {
		console.error(error);
		message.reply('Bei der Commandausführung ist ein Fehler aufgetreten.');
	}
});


client.on('error', err => {
	console.error(err);
});

client.login(token);