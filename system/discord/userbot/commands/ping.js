module.exports = {
    name: 'ping',
    description: 'Checks the bot\'s latency.',
    /**
     * Executes the ping command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(err => {});

        // Send a message indicating that the bot is pinging
        message.channel.send('Pinging...').then(sentMessage => {
            // Calculate the latency (ping) by subtracting the time when the message was sent from the time when it was received
            const latency = sentMessage.createdTimestamp - message.createdTimestamp;

            // Edit the sent message to display the ping
            sentMessage.edit(`:ping_pong: Pong! Latency is ${latency}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        }).catch(console.error);
    }
};
