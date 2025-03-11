const fs = require('fs');
const path = require('path');
const config = require('@configuration');

module.exports = {
    name: 'help',
    description: 'Displays a list of available commands.',
    /**
     * Executes the help command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(err => {});

        // Fetch the list of available commands
        const commandFiles = fs.readdirSync(path.resolve(__dirname, '../commands')).filter(file => file.endsWith('.js'));

        // Initialize the help message
        let helpMessage = `🚀 **Help - Available Commands** 🚀\n\n`;

        // Generate the help message content
        commandFiles.forEach(file => {
            try {
                const command = require(`../commands/${file}`);
                helpMessage += `**${config.discord.prefix}${command.name}**: ${command.description}\n`;
            } catch (error) {
                console.error(`Error loading command file: ${file}`, error);
            }
        });

        // Add footer text
        helpMessage += `\n *NekoBot Made by Lorenzxz*`;

        // Split the help message into chunks of 2000 characters
        const messageChunks = helpMessage.match(/[\s\S]{1,2000}/g);

        // If the message extends more than 2000 characters, send multiple messages
        if (messageChunks.length > 1) {
            // Send each chunk of the help message
            messageChunks.forEach(chunk => {
                channel.send(chunk).catch(err => console.error('Failed to send help message:', err));
            });
        } else {
            // Send the help message
            channel.send(helpMessage).catch(err => console.error('Failed to send help message:', err));
        }
    }
};
