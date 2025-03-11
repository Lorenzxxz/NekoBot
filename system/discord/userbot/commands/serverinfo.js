module.exports = {
    name: 'serverinfo',
    description: 'Displays information about the server.',
    /**
     * Executes the serverinfo command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(err => {});

        // Get the server information
        const guild = message.guild;

        // Check if guild is available
        if (!guild) {
            return message.channel.send('Unable to retrieve server information.');
        }

        // Get the server banner URL
        const bannerURL = guild.bannerURL({ format: 'png', size: 4096 });

        // Construct the server info message
        let serverInfoMessage = `**Server Name:** ${guild.name}\n` +
                                `**Members:** ${guild.memberCount}\n` +
                                `**Created At:** ${guild.createdAt.toDateString()}\n` +
                                `**Roles:** ${guild.roles.cache.size}\n` +
                                `**Channels:** ${guild.channels.cache.size}`;

        // Include server banner if available
        if (bannerURL) {
            serverInfoMessage += `\n**Server Banner:** ${bannerURL}`;
        }

        // Send the server info message to the channel
        message.channel.send(serverInfoMessage);
    }
};
