const axios = require('axios');

module.exports = {
    name: 'bal',
    description: '🔍 Checks the balance of a Litecoin (LTC) wallet address and its equivalent in USD.',
    async execute(channel, message, client, args) {
        if (args.length !== 1) {
            return message.channel.send('❌ Please provide a Litecoin (LTC) wallet address.');
        }

        const ltcAddress = args[0];
        const addressUrl = `https://litecoinspace.org/api/address/${ltcAddress}`;
        const priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd';

        try {
            await message.delete();

            // Fetch address details
            const addressResponse = await axios.get(addressUrl);
            const { address, chain_stats } = addressResponse.data;

            // Fetch current LTC to USD conversion rate
            const priceResponse = await axios.get(priceUrl);
            const usdConversionRate = priceResponse.data.litecoin.usd;

            // Calculate balances
            const balanceLTC = (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) / 100000000; // Convert satoshis to LTC
            const balanceUSD = balanceLTC * usdConversionRate; // Convert LTC to USD using real-time rate

            const balanceMessage = `📈 **Litecoin (LTC) Wallet Address:** ${address}\n` +
                                   `💰 **Current Balance:** ${balanceLTC.toFixed(8)} LTC\n` + // Display balance in LTC
                                   `💵 **Equivalent in USD:** $${balanceUSD.toFixed(2)}\n` + // Display USD equivalent
                                   `📥 **Total Received:** ${(chain_stats.funded_txo_sum / 100000000).toFixed(8)} LTC\n` +
                                   `📤 **Total Sent:** ${(chain_stats.spent_txo_sum / 100000000).toFixed(8)} LTC\n` +
                                   `🔢 **Number of Transactions:** ${chain_stats.tx_count}`;

            message.channel.send(balanceMessage);
        } catch (error) {
            console.error('Error fetching Litecoin balance:', error);
            let errorMsg = '❌ Error fetching Litecoin balance. Please check the provided address.';
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                errorMsg += ` Status: ${error.response.status}`;
            } else if (error.request) {
                console.error('Error with request:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            message.channel.send(errorMsg);
        }
    }
};
