const axios = require("axios");

module.exports = {
  command: ["genshin-stalk"],
  alias: ["gs-stalk", "gistalk"],
  category: ["game"],
  description: "Dapatkan informasi profil Genshin Impact berdasarkan UID",
  settings: {
    loading: true,
  },
  async run(m, { text, sock }) {
    try {
      if (!text) {
        return m.reply(`*• Contoh Penggunaan:* .genshin-stalk [UID]`);
      }

      let { data } = await axios.get(`https://enka.network/api/uid/${text}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });

      if (!data || !data.playerInfo) {
        return m.reply("*[ PLAYER NOT FOUND ]*");
      }

      let playerInfo = data.playerInfo;
      let nickname = playerInfo.nickname || "Not found";
      let arLevel = playerInfo.level || "Not found";
      let signature = playerInfo.signature || "Not found";
      let worldLevel = playerInfo.worldLevel || "Not found";
      let achievement = playerInfo.finishAchievementNum || "Not found";
      let spiralFloorIndex = playerInfo.towerFloorIndex || "Not found";
      let spiralLeverIndex = playerInfo.towerLevelIndex || "Not found";

      let ssurl = `https://enka.network/u/${text}`;
      let screenshot = `https://api.mightyshare.io/v1/19EIFDUEL496RA3F/jpg?url=${ssurl}`;

      let caption = `*[ GENSHIN IMPACT PROFILE ]*\n\n` +
        `• *Nickname:* ${nickname}\n` +
        `• *Adventure Rank:* ${arLevel}\n` +
        `• *Signature:* ${signature}\n` +
        `• *World Level:* ${worldLevel}\n` +
        `• *Achievements:* ${achievement}\n\n` +
        `*[ SPIRAL ABYSS ]*\n` +
        `• *Floor:* ${spiralFloorIndex}\n` +
        `• *Level:* ${spiralLeverIndex}\n\n` +
        `*[ MORE INFO ]*\n` +
        `❀ [View on Enka](https://enka.network/u/${text})\n` +
        `✧ *UID:* ${text}`;

      m.reply({
        image: { url: screenshot },
        caption: caption,
      });
    } catch (error) {
      console.error(error);
      m.reply("❌ *Terjadi kesalahan saat mengambil data!*");
    }
  },
};