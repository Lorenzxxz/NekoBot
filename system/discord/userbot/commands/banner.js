module.exports = {
    name: 'banner',
    description: 'Displays the banner of the user.',
    /**
     * Executes the banner command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Get the user's avatar URL
        const userAvatarURL = message.author.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 });

        // Extract the user's banner URL from the avatar URL
        const userBannerURL = userAvatarURL.split('?')[0] + '.png?size=4096';

        // Send the user's banner if available
        message.channel.send(userBannerURL ? `Here is your banner: ${userBannerURL}` : 'Sorry, unable to fetch your banner.');
    }
};
