module.exports = {
    name: 'guildicon',
    description: 'Displays the guild icon.',
    /**
     * Executes the guildicon command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(console.error);

        // Check if the guild has an icon
        if (!message.guild || !message.guild.icon) {
            return message.channel.send('This guild does not have an icon.').catch(console.error);
        }

        // Get the guild icon URL
        const iconURL = message.guild.iconURL({ dynamic: true });

        // Send the guild icon to the channel
        message.channel.send(`Guild Icon: ${iconURL}`).catch(console.error);
    }
};
