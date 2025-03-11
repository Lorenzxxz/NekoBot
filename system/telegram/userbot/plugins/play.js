const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["play"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Contoh: play impossible");
        reply("🔍 Mencari lagu...");

        let response = await axios.get(`https://www.laurine.site/api/downloader/ytdl?query=${encodeURIComponent(text)}`);
        let data = response.data;
        let audioUrl = data.data;

        const audioPath = "./temp_audio.mp3";
        const responseAudio = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const audioBuffer = responseAudio.data;

        fs.writeFileSync(audioPath, audioBuffer);

        await client.sendMessage(message.peerId, {
            message: `🎶 Memutar: *${text}*`,
            file: audioPath,
            caption: `Lagu: *${text}* 🎵`,
            replyTo: message.id
        });

        fs.unlinkSync(audioPath);
    },
};
