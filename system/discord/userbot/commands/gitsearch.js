const axios = require('axios');

module.exports = {
    name: 'gitsearch',
    description: 'Searches GitHub for repositories.',
    usage: '<query>',
    cooldown: 5,
    /**
     * Executes the gitsearch command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        const query = args.join(' ');

        try {
            const response = await axios.get(`https://api.github.com/search/repositories?q=${query}`);
            const { items } = response.data;

            if (items.length === 0) {
                return message.channel.send('No repositories found for the given query.');
            }

            const repositories = items.slice(0, 5).map(repo => {
                return `[${repo.full_name}](${repo.html_url}) - ${repo.description || 'No description available'}`;
            }).join('\n');

            message.channel.send(`**Top 5 repositories for "${query}":**\n${repositories}`);
        } catch (error) {
            console.error('Error searching GitHub:', error);
            message.channel.send('An error occurred while searching GitHub. Please try again later.');
        }
    }
};
