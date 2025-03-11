const axios = require("axios");

module.exports = {
  command: ["ba", "bluearchive", "blue-archive"],
  alias: ["ba"],
  category: ["game"],
  description: "Dapatkan informasi karakter Blue Archive",
  settings: {
    loading: true,
  },
  async run(m, { text, sock }) {
    try {
      let { data: characters } = await axios.get("https://api.ennead.cc/buruaka/character");
      let charaList = characters.map((char) => char.name);

      let capitalize = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();

      if (!text) {
        m.reply(`*• Contoh Penggunaan:* .bluearchive [nama karakter]\n\n*List karakter yang tersedia:*\n${charaList.map((a) => `• ${a}`).join("\n")}`);
      }

      if (!charaList.includes(capitalize(text))) {
        m.reply(`*• Karakter tidak ditemukan!*\nGunakan salah satu dari daftar berikut:\n${charaList.map((a) => `• ${a}`).join("\n")}`);
      }

      let { data: characterData } = await axios.get(`https://api.ennead.cc/buruaka/character/${capitalize(text)}`);

      if (characterData.StatusCode) {
        return m.reply("*[ CHARACTER NOT FOUND ]*");
      }

      let caption = `*[ BLUE ARCHIVE INFORMATION ]*\n\n` +
        `• *Name:* ${characterData.character.name}\n` +
        `• *Age:* ${characterData.info.age}\n` +
        `• *Height:* ${characterData.info.height}\n` +
        `• *School:* ${characterData.info.school}\n` +
        `• *Year:* ${characterData.info.schoolYear}\n` +
        `• *Club:* ${characterData.info.club}\n` +
        `• *Birth Date:* ${characterData.info.birthDate}\n\n` +
        `• *Base Star:* ${characterData.character.baseStar}\n` +
        `• *Rank:* ${characterData.character.rarity}\n` +
        `• *Role:* ${characterData.character.role}\n` +
        `• *Type:*\n` +
        `  - Squad: ${characterData.character.squadType}\n` +
        `  - Weapon: ${characterData.character.weaponType}\n` +
        `  - Bullet: ${characterData.character.bulletType}\n` +
        `  - Armor: ${characterData.character.armorType}`;

      m.reply(
        {
          image: { url: characterData.image.portrait },
          caption: caption,
        },
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ *Terjadi kesalahan saat mengambil data!*");
    }
  },
};