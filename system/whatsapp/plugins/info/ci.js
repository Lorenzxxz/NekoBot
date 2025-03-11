module.exports = {
  command: "cinfo",
  alias: ["channelinfo", "ci"],
  category: ["info"],
  description:
    "ℹ️ Dapatkan informasi lengkap tentang saluran WhatsApp melalui tautan",
  loading: true,

  async run(m, { sock, Func, text, config }) {
    if (!text || !Func.isUrl(text) || !/whatsapp.com\/channel/.test(text)) {
      return m.reply(
        "> ❌ *Kirim atau balas tautan saluran WhatsApp yang valid!*\n\n" +
          "*Contoh Penggunaan:*\n" +
          "> _${m.prefix}cinfo https://whatsapp.com/channel/example_",
      );
    }

    try {
      m.reply(config.messages.wait);

      let id = text
        .replace(/https:\/\/(www\.)?whatsapp\.com\/channel\//, "")
        .split("/")[0];
      let metadata = await sock.newsletterMetadata("invite", id);

      if (!metadata) {
        return m.reply(
          "> ❌ *Gagal mendapatkan metadata saluran.*\nPastikan tautan yang diberikan benar.",
        );
      }

      let cap = `*✨ Informasi Saluran WhatsApp*\n\n`;
      cap += `📌 *ID Saluran:* ${metadata.id}\n`;
      cap += `📛 *Nama Saluran:* ${metadata.name}\n`;
      cap += `👥 *Pengikut:* ${Func.h2k(metadata.subscribers)}\n`;
      cap += `⏳ *Dibuat Pada:* ${new Date(metadata.creation_time * 1000).toLocaleString("id-ID")}\n`;

      if (metadata.preview) {
        m.reply({
          image: { url: "https://pps.whatsapp.net" + metadata.preview },
          caption: cap,
        });
      } else {
        m.reply(cap);
      }
    } catch (error) {
      console.error("Error:", error);
      m.reply(
        "> ❌ *Terjadi kesalahan saat mengambil informasi saluran.*\n" +
          "Silakan coba lagi nanti.",
      );
    }
  },
};
