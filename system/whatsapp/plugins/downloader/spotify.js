const axios = require("axios");

module.exports = {
  command: "spotify",
  alias: [],
  category: ["downloader"],
  settings: {
    limit: true,
  },
  description: "🎵 Mencari atau mengunduh musik dari Spotify!",
  loading: true,
  async run(m, { sock, Func, Scraper, text }) {
    if (!text)
      throw (
        `*– 乂 Cara Penggunaan 🎶*\n\n` +
        `> *🔍 Masukkan kata kunci* untuk mencari musik\n` +
        `> *🔗 Masukkan URL Spotify* untuk mengunduh musik\n\n` +
        `*– 乂 Contoh Penggunaan 📋*\n` +
        `> *${m.prefix + m.command} Imagine Dragons*\n` +
        `> *${m.prefix + m.command} https://open.spotify.com/track/examplelink*`
      );

    if (/open.spotify.com/.test(text)) {
      let data = await Scraper.spotify.download(text);
      let cap = `*– 乂 Spotify - Downloader 🎵*\n\n`;
      cap += Object.entries(data)
        .map(([a, b]) => `> *🎧 ${a.capitalize()} :* ${b}`)
        .join("\n");

      m.reply(cap).then(() => {
        m.reply({
          audio: {
            url: data.download,
          },
          mimetype: "audio/mpeg",
        });
      });
    } else {
      let data = await Scraper.spotify.search(text);
      if (!data || data.length === 0) throw `> *❌ Musik tidak ditemukan!*`;

      let cap =
        `*– 乂 Spotify - Pencarian 🔎*\n\n` +
        `> Ketik *${m.prefix + m.command} [URL]* untuk mengunduh musik pilihanmu 🎶\n\n`;
      cap += data
        .map((a) =>
          Object.entries(a)
            .map(([b, c]) => `> *🎵 ${b.capitalize()} :* ${c}`)
            .join("\n"),
        )
        .join("\n\n");

      m.reply(cap);
    }
  },
};
