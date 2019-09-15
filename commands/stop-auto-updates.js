module.exports = {
	name: 'stop-auto-updates',
	description: 'Stoppt den automatischen Rollenupdater.',
	args: false,
	staffOnly: true,
	execute(message, args, updater) {
		if (!updater.stopped) {
			updater.stop();
			message.channel.send('Gestoppt.');
		} else {
			message.channel.send('Updater lief nicht.');
		}
	},
};