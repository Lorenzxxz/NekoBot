/* Features Play YouTube
 * Base API : https://axeel.my.id/docs
 * Code by : Lorenzxz
 */

const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  command: "ytmp3",
  alias: ["play", "yta"],
  category: ["downloader"],
  settings: {
    limit: true,
  },
  description: "Cari dan unduh audio dari YouTube",
  async run(m, { sock, Func, text }) {
    if (!text) {
      return m.reply(
        `╭──[❌ *Masukkan Input yang Valid* ]
᎒⊸ Ketik teks untuk mencari video YouTube, atau masukkan link YouTube yang valid.
᎒⊸ Contoh: *${m.prefix}play Lathi* atau *${m.prefix}play https://youtu.be/abc123*
╰────────────•`,
      );
    }

    m.reply(`╭──[⏳ *Sedang Diproses* ]
᎒⊸ *Mohon tunggu sebentar...*
╰────────────•`);

    let isUrl = Func.isUrl(text);
    let videoUrl;

    if (isUrl) {
      videoUrl = isUrl[0];
    } else {
      let searchResult = await yts(text);
      let randomVideo = searchResult.videos.getRandom();
      if (!randomVideo) {
        return m.reply(
          `╭──[❌ *Hasil Tidak Ditemukan* ]
᎒⊸ Tidak ada video ditemukan dengan kata kunci *"${text}"*. Coba gunakan kata kunci lain!
╰────────────•`,
        );
      }
      videoUrl = randomVideo.url;
    }

    let { data } = await axios
      .get(`https://ytdl.axeel.my.id/api/download/audio?url=${videoUrl}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .catch((e) => e.response);

    if (!data?.metadata) {
      return m.reply(
        `╭──[❌ *Terjadi Kesalahan* ]
᎒⊸ Tidak dapat memproses permintaan Anda. Coba lagi nanti atau gunakan URL lain.
╰────────────•`,
      );
    }

    let metadata = data.metadata;
    metadata.thumbnail = metadata.thumbnail.url;

    let cap = `╭──[🎵 *YouTube - Audio Downloader* ]
 ${Object.entries(metadata)
   .map(([a, b]) => `᎒⊸ *${a.capitalize()}*       : ${b}`)
   .join("\n")}
╰────────────•

📝 *Catatan:*
᎒⊸ Anda akan menerima thumbnail dan file audio dari video ini.
᎒⊸ Jika file audio tidak terkirim, periksa URL atau coba lagi nanti.

🔗 *Link Video*: ${videoUrl}
© Simple WhatsApp Bot by Lorenzxz`;

    sock
      .sendMessage(
        m.cht,
        {
          image: { url: metadata.thumbnail },
          caption: cap,
        },
        { quoted: m },
      )
      .then((sent) => {
        sock.sendMessage(
          m.cht,
          {
            audio: data.downloads,
            mimetype: "audio/mpeg",
          },
          { quoted: sent },
        );
      });
  },
};
