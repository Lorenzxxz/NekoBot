const axios = require("axios");

const cmd = {
  command: "waifu",
  category: ["anime"],
  alias: ["waifu"],
  description: "Gambar Random Waifu",
  loading: true,
  async run(m, { sock, config }) {
    try {
      let json = await axios.get("https://api.waifu.pics/sfw/waifu");
      let cap = `*– 乂 **Waifu Random**:*\n> 💫 *Gambar Waifu yang Baru* \n> *Ketik ${m.prefix + m.command} lagi untuk mendapatkan gambar baru!*`;

      m.reply({
        image: json.data.url,
        caption: cap,
      });
    } catch (err) {
      m.reply("> ❌ Terjadi kesalahan, coba lagi nanti.");
    }
  },
};

module.exports = cmd;
