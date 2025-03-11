const Jimp = require("jimp");

class Command {
  constructor() {
    this.command = "setppbot";
    this.alias = ["setpp", "setppbotwa"];
    this.category = ["owner"];
    this.settings = {
      owner: true,
    };
    this.description = "📸 *Mengubah Foto Profil Bot* 💬";
    this.loading = true;
  }

  run = async (m, { sock, Func, Scraper, config, store }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      let media = await q.download();
      let { img } = await pepe(media);
      await sock.updateProfilePicture(sock.decodeJid(sock.user.id), img);
      m.reply(
        "> 🎉 *Berhasil mengubah profile picture bot!* 🎉\n> *Foto profil bot telah diperbarui.*",
      );
    } else {
      m.reply(
        "> ⚠️ *Balas/Kirim gambar yang ingin dijadikan profile picture bot.*\n> Pastikan gambar yang dikirim tidak dalam format webp.",
      );
    }
  };
}
module.exports = new Command();

async function pepe(media) {
  const jimp = await Jimp.read(media),
    min = jimp.getWidth(),
    max = jimp.getHeight(),
    cropped = jimp.crop(0, 0, min, max);

  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
  };
}
