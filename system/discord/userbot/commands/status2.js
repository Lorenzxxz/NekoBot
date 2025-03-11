const Discord = require('discord.js-selfbot-v13');

module.exports = {
    name: 'status2',
    description: 'Set a custom status with Rich Presence.',
    execute(channel, message, client, args) {
        console.clear();
        console.log(`${client.user.tag} - rich presence started!`);
        
        // Send a message in the same channel where the command was used, confirming that the rich presence has started
        message.channel.send('Rich Presence started.').catch(console.error);

        // Check if the first argument is "streaming"
        if (args[0] && args[0].toLowerCase() === 'streaming') {
            // Check if enough arguments are provided for streaming status
            if (args.length < 2) {
                return message.channel.send('Please provide the streaming URL and status message. Usage: !status2 streaming <URL> <message>').catch(console.error);
            }
            
            const url = args[1]; // Streaming URL
            const statusMessage = args.slice(2).join(' '); // Status message

            // Set the streaming status
            client.user.setActivity(statusMessage, { type: 'STREAMING', url: url });
            message.channel.send(`Streaming status set to "${statusMessage}"`).catch(console.error);
        } else {
            // Set the default custom status using Rich Presence
            const r = new Discord.RichPresence()
                .setType('STREAMING')
                .setURL('https://www.twitch.tv/zenithsenpai07')
                .setState('bye afk <3')
                .setName('<3')
                .setDetails('Details')
                .setAssetsLargeImage('https://cdn.discordapp.com/avatars/1210993586187796510/a_adfe2482217fe513c7000a3f77b79bc1.gif?size=1024')
                .setAssetsLargeText('add1')
                .setAssetsSmallImage('https://cdn.discordapp.com/avatars/1210993586187796510/a_adfe2482217fe513c7000a3f77b79bc1.gif?size=1024')
                .setAssetsSmallText('add2')
                .addButton('add1', 'https://discord.gg/5NmRywHM')
                .addButton('add2', 'https://discord.gg/5NmRywHM');
    
            client.user.setActivity(r);
        }
        
        // Set presence status to "streaming"
        client.user.setPresence({ status: "streaming" });
    }
};
