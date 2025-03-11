const Discord = require('discord.js-selfbot-v13');

module.exports = {
    name: 'status3',
    description: 'Change the status automatically with different images in a loop.',
    execute(channel, message, client, args) {
        // Function to set the status
        const setStatus = (statusIndex) => {
            // Clear the console
            console.clear();

            // Log a message indicating that the status changer started
            console.log(`${client.user.tag} - status changer started!`);

            // Array of status objects with different details and images
            const statuses = [
                {
                    name: 'Self Respect',
                    details: 'Self respect',
                    largeImageURL: 'https://cdn.discordapp.com/attachments/1218882306475950204/1233074089778876467/pngimg.com_-_number1_PNG14889.png?ex=662bc53c&is=662a73bc&hm=fafb310a8226b5afe86286ae5959e3bb23287f9291793973c969c46296416d85&'
                },
                {
                    name: 'Self Improvement',
                    details: 'Self improvement',
                    largeImageURL: 'https://cdn.discordapp.com/attachments/1218882306475950204/1233074090244440094/number-2-tm-photo-16.png?ex=662bc53c&is=662a73bc&hm=931e899b927203b1cf52080c872de42217ddd1543b8e051322b0db09fa16d74f&'
                },
                {
                    name: 'Proper Diet',
                    details: 'Proper diet',
                    largeImageURL: 'https://cdn.discordapp.com/attachments/1218882306475950204/1233074090647224340/images_1.png?ex=662bc53c&is=662a73bc&hm=c4d084292296c819f07b9151af8533490849086838032573f7ac7c2f5dff1a15&'
                }
            ];

            // Get the current status object
            const status = statuses[statusIndex];

            const r = new Discord.RichPresence()
                .setType('STREAMING')
                .setURL('https://www.twitch.tv/zenithsenpai') // Change if needed
                .setState(status.name)
                .setName(status.name)
                .setDetails(status.details)
                .setAssetsLargeImage(status.largeImageURL) // Change to status.largeImageURL
                .setAssetsLargeText('devrock.exe') // Set as needed
                .addButton('Youtube', 'https://www.youtube.com/@ZenithSenpai') // Add button name and URL
                .addButton('Discord', 'https://discord.gg/Rcn5ZhPt9J'); // Add button name and URL

            client.user.setActivity(r);

            // Log a message indicating that the status is changed
            console.log(`Status ${statusIndex + 1} set!`);

            // Increment status index and loop back to the start if it exceeds the array length
            const nextIndex = (statusIndex + 1) % statuses.length;

            // Call setStatus recursively after 10 seconds (adjustable)
            setTimeout(() => {
                setStatus(nextIndex);
            }, 10000); // Change 10000 to the interval you desire in milliseconds (e.g., 10000 for 10 seconds)
        };

        // Call setStatus to start the status changer loop
        setStatus(0);

        // Send a message indicating that the status changer is started
        channel.send('Status changer started.').catch(err => console.error('Failed to send message:', err));
    }
};