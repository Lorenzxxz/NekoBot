module.exports = {
    name: 'upi',
    description: '💳 Pay Here (UPI) ID along with an image in a styled message with emojis.',
    /**
     * Executes the upi command.
     * 
     * @param {Channel} channel The channel where the command was executed.
     * @param {Message} message The message object for the command.
     * @param {Client} client The client or bot instance.
     * @param {String[]} args The arguments passed with the command.
     */
    async execute(channel, message, client, args) {
        // Replace 'YOUR_UPI_ID' with your actual UPI ID
        const upiID = 'devrock@fam';

        try {
            // Send the UPI ID as a message
            await message.channel.send(`💳 **Your UPI (Unified Payments Interface) ID:**\n\n||${upiID}||`);
            
            // Send the image as a separate message
            await message.channel.send({
                files: [{
                    attachment: './images/upi_qr_code.png', // Example: './images/upi_qr_code.png'
                    name: 'upi_qr_code.png'
                }]
            });
        } catch (error) {
            console.error('Error sending UPI message:', error);
            message.channel.send('Error sending UPI message. Please try again later.');
        }
    }
};
