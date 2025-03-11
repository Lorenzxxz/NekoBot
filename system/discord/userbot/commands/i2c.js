// Define the conversion rate from INR to USD
const INR_TO_USD_RATE = 1 / 91; // Example: 1 INR = 0.014 USD

module.exports = {
    name: 'i2c',
    description: 'Converts an amount from INR to USD.',
    cooldown: 3,
    /**
     * Executes the inr2usd command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        const amountStr = args[0]; // Assuming the amount is passed as the first argument

        // Check if amount is provided
        if (!amountStr) {
            return message.channel.send('Please provide an amount in INR to convert to Ltc.');
        }

        // Convert the amount to float
        const amount = parseFloat(amountStr);

        // Check if the amount is a valid number
        if (isNaN(amount)) {
            return message.channel.send('Invalid amount provided.');
        }

        // Calculate the amount in USD using the conversion rate
        const usdAmount = amount * INR_TO_USD_RATE;

        // Send the result to the channel
        message.channel.send(`Amount in INR: ₹${amount.toFixed(2)}\nAmount in Ltc: $${usdAmount.toFixed(2)}`);
    }
};
