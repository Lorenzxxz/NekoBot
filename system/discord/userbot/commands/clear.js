module.exports = {
    name: "clear",
    description: "Delete messages off a channel",
    /**
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     */
    async execute(channel, message, client) {
        // Assuming args are contained within the message content
        // Splitting message content to extract command arguments
        const args = message.content.split(/\s+/).slice(1); // This removes the command keyword itself and leaves just the arguments

        const config = client.config || { interval: 1000 };
        const number = !isNaN(parseInt(args[0], 10)) ? parseInt(args[0], 10) : 99;

        // Delete the command message
        message.delete().catch(err => {});

        // Adjusted for correct use
        setTimeout(() => {
            message.delete().catch((err) => {});
        }, config.interval);

        const messages = await channel.messages.fetch({ limit: Math.min(number, 100) });
        const filteredMessages = messages.filter(x => x.author.id === client.user.id);

        let deletedCount = 0;

        for (let msg of filteredMessages.values()) {
            if (deletedCount >= number) break;
            await msg.delete().catch(err => {});
            deletedCount++;
        }
    }
};
