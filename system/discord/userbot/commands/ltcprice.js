const axios = require('axios');

module.exports = {
    name: 'ltcprice',
    description: '📈 Fetches the current price of Litecoin (LTC).',
    /**
     * Executes the ltcprice command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        try {
            // Fetch Litecoin price data from CoinGecko API
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd');
            const ltcPrice = response.data.litecoin.usd;

            // Send the current Litecoin price to the channel with style
            message.channel.send(`📈 The current price of **Litecoin (LTC)** is: **$${ltcPrice}** 💰`);
            message.channel.send(`┃┃│${ltcPrice} USD┃┃`);
        } catch (error) {
            console.error('Error fetching Litecoin price:', error);
            message.channel.send('❌ Error fetching Litecoin price. Please try again later.');
        }
    }
};
