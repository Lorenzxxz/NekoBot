const commandHandler = require('./commandHandler');
const config = require('@configuration');
module.exports = (client) => {
    client.on('messageCreate', message => {
        if (!message.author || message.author.bot) return;
        
        if (!message.content.startsWith(config.discord.prefix)) return;

        const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commandHandler.getCommand(commandName);
        if (!command) return;
        
        if (!config.discord.allowedUserIDs.includes(message.author.id)) {
            return message.channel.send("You are not allowed to use this command.").catch(console.error);
        }
        
        command.execute(message.channel, message, client, args);        
    });
};
