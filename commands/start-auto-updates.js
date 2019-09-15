module.exports = {
	name: 'start-auto-updates',
	description: 'Startet den automatischen Rollenupdater.',
	args: false,
	staffOnly: true,
	execute(message, args, updater) {
		if (updater.stopped) {
			console.log(updater);
			updater.start();
			console.log(updater);
			message.channel.send('Gestartet.');
		} else {
			message.channel.send('Updater läuft bereits.');
			console.log(updater);
		}
	},
};