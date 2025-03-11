const axios = require("axios");

module.exports = {
  command: "wuwa",
  alias: ["wuthering"],
  category: ["game"],
  description: "Cek karakter Wuthering Waves",
  settings: {
    loading: true,
  },
  async run(m, { text, sock }) {
    let charactersList = [
      "Aalto", "Baizhi", "Calcharo", "Changli", "Chixia", "Danjin",
      "Encore", "Jianxin", "Jinhsi", "Jiyan", "Lingyang", "Mortefi",
      "Rover", "Sanhua", "Shorekeeper", "Taoqi", "Verina",
      "Xiangli Yao", "Yangyang", "Yinlin", "Youhu", "Yuanwu", "Zhezhi"
    ];

    let capital = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();

    if (!text) {
      throw `*• Contoh Penggunaan:* .wuthering [nama karakter]\n\n*List karakter yang tersedia:*\n${charactersList.map(a => `• ${a}`).join("\n")}`;
    }

    if (!charactersList.includes(capital(text))) {
      throw `*• Karakter tidak ditemukan!*\nGunakan salah satu dari daftar berikut:\n${charactersList.map(a => `• ${a}`).join("\n")}`;
    }

    try {
      let { data: characters } = await axios.get(`https://api.resonance.rest/characters/${capital(text)}`);
      
      let weaponType = characters.weapon.replace(/\s+/g, "%20");
      let { data: weaponData } = await axios.get(`https://api.resonance.rest/weapons/${weaponType}`);

      let weaponList = await Promise.all(
        weaponData.weapons.map(async (weaponName) => {
          let { data: weaponDetails } = await axios.get(
            `https://api.resonance.rest/weapons/${weaponType}/${encodeURIComponent(weaponName)}`
          );
          return `• Name: ${weaponDetails.name}\n  • Type: ${weaponDetails.type}\n  • Rarity: ${weaponDetails.rarity}`;
        })
      );

      let caption = `*[ WUTHERING - CHARACTERS ]*\n\n` +
        `• *Name:* ${characters.name}\n` +
        `• *Quote:* ${characters.quote}\n` +
        `• *Attributes:* ${characters.attribute}\n` +
        `• *Weapons:* ${characters.weapon}\n` +
        `• *Rarity:* ${characters.rarity}\n` +
        `• *Class:* ${characters.class}\n` +
        `• *Birth Place:* ${characters.birthplace}\n` +
        `• *Birthday:* ${characters.birthday}\n\n` +
        `*[ ${characters.weapon.toUpperCase()} - INFO ]*\n\n` +
        `${weaponList.join("\n\n")}`;

      m.reply(
        {
          image: { url: `https://api.resonance.rest/characters/${capital(text)}/portrait` },
          caption: caption,
        },
      );
    } catch (error) {
      console.error(error);
      m.reply("❌ *Terjadi kesalahan saat mengambil data!*");
    }
  },
};