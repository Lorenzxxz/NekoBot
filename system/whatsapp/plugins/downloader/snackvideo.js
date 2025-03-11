class Command {
  constructor() {
    this.command = "snackvideo";
    this.alias = [];
    this.category = ["downloader"];
    this.settings = {
      limit: true,
    };
    this.description = "🔍 Mencari atau mengunduh video dari SnackVideo!";
    this.loading = true;
  }
  run = async (m, { sock, Func, Scraper, config, store, text }) => {
    if (!text)
      throw (
        `*– 乂 Cara Penggunaan 🍿*\n\n` +
        `> Masukkan **query** untuk mencari video\n` +
        `> Masukkan **URL** dari SnackVideo untuk mengunduh\n\n` +
        `*– 乂 Contoh Penggunaan 📋*\n` +
        `> ${m.prefix}snackvideo Anime\n` +
        `> ${m.prefix}snackvideo https://www.snackvideo.com/@ALBAN_105/video/5221792395456439006`
      );

    if (Func.isUrl(text)) {
      if (!/snackvideo.com/.test(text))
        throw `> *❌ Masukkan URL dari SnackVideo yang valid!*`;

      let data = await Scraper.snackvideo.download(text);
      let caption = `*– 乂 SnackVideo - Downloader 📥*\n\n`;
      caption += Object.entries(data.metadata)
        .map(([a, b]) => `> *🔹 ${a.capitalize()} :* ${b}`)
        .join("\n");

      sock.sendFile(m.cht, data.download, null, caption, m);
    } else {
      let data = await Scraper.snackvideo.search(text);
      if (data.length === 0) throw `> *❌ Video tidak ditemukan!*`;

      let caption = `*– 乂 SnackVideo - Pencarian 🔎*\n\n`;
      caption += data
        .map(
          (a) =>
            `> *🎥 Judul :* ${a.title}\n` +
            `> *📅 Diunggah :* ${a.uploaded}\n` +
            `> *👤 Pengarang :* ${a.author.name}\n` +
            `> *🔗 URL :* ${a.url}`,
        )
        .join("\n\n");

      m.reply(caption);
    }
  };
}

module.exports = new Command();
