class Command {
  constructor() {
    this.command = "removebg";
    this.alias = ["rembg", "hapuslatar"];
    this.category = ["tools"];
    this.settings = {
      limit: true,
    };
    this.description =
      "Hapus latar belakang foto secara otomatis dengan mudah!";
    this.loading = true;
  }

  run = async (m, { Func, Scraper }) => {
    let target = m.quoted ? m.quoted : m;
    if (!/image/.test(target.msg.mimetype))
      throw "⚠️ *Oops!* Harap kirim atau balas foto yang ingin dihapus latarnya.";

    let buffer = await target.download();
    let processedImage = await Scraper.removebg(buffer);

    let caption = `✨ *Remove Background Tool* ✨\n\n`;
    caption += `📂 *Ukuran asli:* ${Func.formatSize(buffer.length)}\n`;
    caption += `🎉 *Hasil telah diproses dengan sukses!*\n\n`;
    caption += `💡 *Tips:* Pastikan foto memiliki latar belakang yang kontras untuk hasil terbaik.`;

    m.reply({
      image: { url: processedImage },
      caption,
    });
  };
}

module.exports = new Command();
