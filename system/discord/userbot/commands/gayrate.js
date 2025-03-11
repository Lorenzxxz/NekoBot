module.exports = {
    name: 'gayrate',
    description: 'Rates how gay a user is.',
    execute(channel, message, client, args) {
        // Check if a user is mentioned
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.channel.send('Please mention a user to rate their gayness.');
        }

        // Generate a random gayness rating between 0 and 100
        const gayness = Math.floor(Math.random() * 101);

        // Send the gayness rating to the channel
        message.channel.send(`${member.user.username} is ${gayness}% gay.`);
    }
};
