module.exports = {
    name: 'ban',
    description: 'Bans a user from the server.',
    usage: '@user',
    cooldown: 5,
    /**
     * Executes the ban command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Check if the user has permission to ban members
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.channel.send('You do not have permission to ban members.');
        }

        // Check if a user was mentioned
        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.channel.send('Please mention a user to ban.');
        }

        // Check if the bot has permission to ban members
        if (!message.guild.members.me.permissions.has('BAN_MEMBERS')) {
            return message.channel.send('I do not have permission to ban members.');
        }

        // Attempt to ban the user
        targetUser.ban({ reason: 'Banned by command' })
            .then(() => {
                message.channel.send(`Successfully banned ${targetUser.user.tag}.`);
            })
            .catch(error => {
                console.error('Error banning user:', error);
                message.channel.send('Failed to ban user. Please check permissions and try again.');
            });
    }
};
