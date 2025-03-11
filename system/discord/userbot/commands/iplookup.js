const axios = require('axios');

module.exports = {
    name: 'iplookup',
    description: 'Lookup information about an IP address.',
    /**
     * Executes the iplookup command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        // Delete the command message
        message.delete().catch(console.error);

        // Check if an IP address is provided
        if (args.length === 0) {
            return message.channel.send('Please provide an IP address to lookup.').catch(console.error);
        }

        // Get the IP address from the command arguments
        const ipAddress = args[0];

        try {
            // Fetch IP information from ip-api.com
            const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
            const data = response.data;

            // Construct the IP information message
            const ipInfoMessage = `IP Address: ${data.query}\n` +
                                  `Country: ${data.country}\n` +
                                  `Region: ${data.regionName}\n` +
                                  `City: ${data.city}\n` +
                                  `ISP: ${data.isp}`;

            // Send the IP information to the channel
            message.channel.send(ipInfoMessage).catch(console.error);
        } catch (error) {
            console.error('Error looking up IP address:', error);
            message.channel.send('Error looking up IP address. Please try again later.').catch(console.error);
        }
    }
};
