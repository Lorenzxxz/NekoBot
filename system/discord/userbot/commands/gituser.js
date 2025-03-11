const axios = require('axios');

module.exports = {
    name: 'gituser',
    description: 'Retrieves information about a GitHub user.',
    usage: '<username>',
    cooldown: 5,
    /**
     * Executes the gituser command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        const username = args[0];

        try {
            const response = await axios.get(`https://api.github.com/users/${username}`);
            const userData = response.data;

            const userInfo = `**Username:** ${userData.login}\n` +
                             `**Name:** ${userData.name || 'Not available'}\n` +
                             `**Bio:** ${userData.bio || 'Not available'}\n` +
                             `**Followers:** ${userData.followers}\n` +
                             `**Following:** ${userData.following}\n` +
                             `**Public Repositories:** ${userData.public_repos}\n` +
                             `**URL:** [Profile](${userData.html_url})`;

            message.channel.send(userInfo);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                message.channel.send('User not found.');
            } else {
                console.error('Error retrieving GitHub user information:', error);
                message.channel.send('An error occurred while retrieving user information. Please try again later.');
            }
        }
    }
};
