const axios = require('axios');
const util = require('util');

module.exports = {
    type: 'tools',
    command: ['fetch'],
    operate: async (context) => {
        const {
            client,
            message,
            args,
            command
        } = context;

        const text = args.join(" ");
        
        if (typeof text !== 'string' || !text.trim()) {
            return message.reply(`Add Input (Link)\n\nExample: ${command} https://example.com`);
        }

        const isUrl = (url) => {
            return url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
        };
        
        const urlMatch = isUrl(text);
        if (!urlMatch) {
            return message.reply('Invalid URL provided. Please provide a valid URL.\n\nExample: ' + command + ' https://example.com');
        }

        const url = urlMatch[0];
        try {
            const res = await axios.get(url);

            if (!/json|html|plain/.test(res.headers['content-type'])) {
                return message.reply(`The content type of the provided URL is not supported.\n\nSupported types: json, html, plain text.`);
            }

            const content = util.format(res.data);
            const buffer = Buffer.from(content, 'utf-8');
            
            await message.channel.send({
                files: [{ attachment: buffer, name: 'fetch_result.txt' }]
            });
        } catch (e) {
            message.reply(`Error fetching data from the provided URL: ${util.format(e.message)}`);
        }
    }
};