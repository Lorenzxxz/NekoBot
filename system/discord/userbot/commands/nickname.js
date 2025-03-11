module.exports = {
    name: 'setnickname',
    description: 'Changes your own nickname.',
    cooldown: 5,
    /**
     * Executes the setnickname command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Check if the bot has permission to change nicknames
        if (!message.guild.me.permissions.has('CHANGE_NICKNAME')) {
            return message.channel.send('I do not have permission to change nicknames.');
        }
        
        // Extract the new nickname from the command arguments
        const newNickname = args.join(' ');

        // Check if a new nickname is provided
        if (!newNickname) {
            return message.channel.send('Please provide a new nickname.');
        }

        // Change the user's nickname
        message.member.setNickname(newNickname)
            .then(() => {
                message.channel.send(`Your nickname has been changed to "${newNickname}".`);
            })
            .catch(error => {
                console.error('Error changing nickname:', error);
                message.channel.send('Failed to change nickname. Please check permissions and try again.');
            });
    }
};
