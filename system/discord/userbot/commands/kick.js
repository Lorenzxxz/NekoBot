module.exports = {
    name: 'kick',
    description: 'Kicks a user from the server.',
    usage: '@user',
    cooldown: 5,
    /**
     * Executes the kick command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Check if the user has permission to kick members
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.channel.send('You do not have permission to kick members.');
        }

        // Check if a user was mentioned
        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.channel.send('Please mention a user to kick.');
        }

        // Check if the bot has permission to kick members
        if (!message.guild.members.me.permissions.has('KICK_MEMBERS')) {
            return message.channel.send('I do not have permission to kick members.');
        }

        // Attempt to kick the user
        targetUser.kick({ reason: 'Kicked by command' })
            .then(() => {
                message.channel.send(`Successfully kicked ${targetUser.user.tag}.`);
            })
            .catch(error => {
                console.error('Error kicking user:', error);
                message.channel.send('Failed to kick user. Please check permissions and try again.');
            });
    }
};
