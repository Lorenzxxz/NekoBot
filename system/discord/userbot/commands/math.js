module.exports = {
    name: 'math',
    description: 'Evaluates a mathematical expression.',
    /**
     * Executes the math command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(console.error);

        // Check if there is an expression to evaluate
        if (args.length === 0) {
            return message.channel.send('Please provide a mathematical expression to evaluate.').catch(console.error);
        }

        try {
            // Evaluate the mathematical expression
            const result = eval(args.join(' '));

            // Send the result to the channel
            message.channel.send(`Result: ${result}`).catch(console.error);
        } catch (error) {
            console.error('Error evaluating mathematical expression:', error);
            message.channel.send('Error evaluating mathematical expression. Please check your input.').catch(console.error);
        }
    }
};
