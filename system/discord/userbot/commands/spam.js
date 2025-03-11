module.exports = {
    name: 'spam',
    description: 'Spams a message multiple times.',
    /**
     * Executes the spam command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(console.error);

        // Extract spam message and count from arguments
        const spamMessage = args.slice(1).join(' ');
        let count = parseInt(args[0]);

        // Check if count is a valid number and within the limit
        if (isNaN(count) || count <= 0 || count > 100) {
            return message.channel.send('Please provide a valid number between 1 and 100 for the spam count.').catch(console.error);
        }

        // Limit count to 100
        count = Math.min(count, 100);

        // Send the spam message multiple times
        for (let i = 0; i < count; i++) {
            channel.send(spamMessage).catch(console.error);
        }
    }
};
