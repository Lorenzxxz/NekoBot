module.exports = {
    name: 'avatar',
    description: 'Displays the avatar of the mentioned user.',
    /**
     * Executes the avatar command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(console.error);

        // Check if a user is mentioned
        if (!message.mentions.users.size) {
            return message.channel.send('Please mention a user to get their avatar.').catch(console.error);
        }

        // Get the mentioned user
        const mentionedUser = message.mentions.users.first();

        // Get the mentioned user's avatar URL
        const userAvatarURL = mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        // Send the mentioned user's avatar
        message.channel.send(`${mentionedUser.username}'s avatar: ${userAvatarURL}`).catch(console.error);
    }
};
