module.exports = {
  command: "Instagram",
  alias: ["igdl", "ig", "igvideo", "igreel"],
  category: ["downloader"],
  settings: {
    limit: true,
  },
  description: "Mengunduh Reels/postingan Instagram",
  loading: true,
  async run(m, { sock, Func, text, Scraper }) {
    if (!text)
      throw `*– 乂 Cara Penggunaan :*
> *Masukkan atau balas pesan dengan link Instagram yang ingin diunduh*
> *Contoh :* ${m.prefix + m.command} https://www.instagram.com/reel/xxxxx/

*– 乂 Petunjuk :*
> Link yang valid hanya bisa berupa Postingan atau Reels dari Instagram.`;

    if (!/instagram.com/.test(text))
      throw "*– 乂 Masukkan Link Instagram yang Valid :*\n> Pastikan link yang dimasukkan berasal dari Instagram.";

    let data = await Scraper.Instagram(text);
    if (!data) return;

    for (let i of data.url) {
      let res = await fetch(i);
      let cap = `*– 乂 Instagram Downloader :*\n`;
      cap += Object.entries(data.metadata)
        .map(([a, b]) => `> *- ${a.capitalize()} :* ${b}`)
        .join("\n");

      sock.sendFile(m.cht, Buffer.from(await res.arrayBuffer()), null, cap, m);
    }
  },
};
