// Import necessary packages
const axios = require('axios');

module.exports = {
    name: 'randomavatar',
    description: 'Sends a random profile picture.',
    /**
     * Executes the randomavatar command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        try {
            // Generate a random text string (e.g., a UUID)
            const randomText = Math.random().toString(36).substring(7);

            // Make a GET request to the RoboHash API to fetch a random robot avatar
            const response = await axios.get(`https://robohash.org/${randomText}`, {
                responseType: 'arraybuffer' // Set response type to arraybuffer to handle binary data
            });

            // Create a Buffer from the response data
            const avatarBuffer = Buffer.from(response.data, 'binary');

            // Send the avatar as an attachment in the specified channel
            channel.send({
                files: [{
                    attachment: avatarBuffer,
                    name: 'random_avatar.png' // Name of the uploaded file
                }]
            });
        } catch (error) {
            console.error('Error fetching random avatar:', error);
            message.reply('An error occurred while fetching the random avatar.');
        }
    }
};
