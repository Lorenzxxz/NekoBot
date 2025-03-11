module.exports = {
    name: 'loverate',
    description: 'Rates the compatibility of two mentioned users as lovers.',
    execute(channel, message, client, args) {
        // Check if two users are mentioned
        const mentionedMembers = message.mentions.members;
        
        if (mentionedMembers.size !== 2) {
            return message.channel.send('Please mention exactly two users to rate their compatibility as lovers.');
        }

        // Generate a random compatibility rating between 0 and 100
        const compatibility = Math.floor(Math.random() * 101);

        // Extract usernames of mentioned users
        const [user1, user2] = mentionedMembers.map(member => member.user.username);

        // Send the compatibility rating to the channel
        message.channel.send(`The compatibility rating between ${user1} and ${user2} as lovers is ${compatibility}%.`);
    }
};
