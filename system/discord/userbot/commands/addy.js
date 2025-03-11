module.exports = {
    name: 'addy',
    description: '🔑 Sends your Litecoin (LTC) wallet address in a styled message with emojis.',
    /**
     * Executes the ltcaddress command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    execute(channel, message, client, args) {
        // Replace 'YOUR_LTC_ADDRESS' with your actual Litecoin wallet address
        const ltcAddress = 'LcPnFkTa5UTav5Ue3dM6GdLh7LpTm47JZx';

        // Styled message with emojis
        const addressMessage = `🔒 **Pay Here (LTC) Wallet Address:**\n\n` +
                               `||${ltcAddress}||`;

        // Send the styled message to the channel
        message.channel.send(addressMessage);
    }
};
