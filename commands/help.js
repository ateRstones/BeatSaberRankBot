const { prefix } = require('../config.json');
module.exports = {
	name: 'help',
	description: 'Listet alle Commands auf und gibt genauere Infos für spezifische Commands.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Hier eine Liste meiner Commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nDu kannst \`${prefix}help [command name]\` schreiben, um Informationen über ein spezifisches Command zu bekommen.`);

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('Ich habe dir ein DM mit all meinen Commands geschickt.');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('Ich konnte dir keine DM schicken. Hast du sie abgestellt?');
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('Das ist kein valider Command!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Beschreibung:** ${command.description}`);
		if (command.usage) data.push(`**Benutzung:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} Sekunde(n)`);

		message.channel.send(data, { split: true });
	},
};