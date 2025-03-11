const { writeExif } = require(process.cwd() + "/library/sticker.js");

module.exports = {
  command: "furbrat",
  alias: ["hikagen"],
  category: ["tools"],
  settings: {
    limit: true,
  },
  description: "🐾 Membuat Brat versi furry :v",
  loading: true,
  async run(m, { sock, text, Func, config }) {
    if (!text)
      throw "> ❌ *Masukan teks yang ingin kamu ubah menjadi furry brat!*";

    let random = Math.floor(Math.random() * 7);
    let API = `https://fastrestapis.fasturl.link/tool/furbrat?text=${text}&style=${random}&mode=center`;

    try {
      let buffer = await Func.fetchBuffer(API);
      let sticker = await writeExif(
        {
          mimetype: "image",
          data: buffer,
        },
        {
          packName: config.sticker.packname,
          packPublish: config.sticker.author,
        },
      );

      m.reply({
        sticker,
      });
      m.reply("> ✅ *Brat versi furry berhasil dibuat!*");
    } catch (error) {
      console.error("Error fetching furry brat:", error);
      m.reply("> ❌ *Terjadi kesalahan saat membuat furry brat, coba lagi.*");
    }
  },
};
