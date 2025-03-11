let neko = async (m, { sock, Func, Scraper, text, Uploader }) => {
  if (!text) throw "> *❌ Masukkan query atau link dari Pinterest!*";

  if (Func.isUrl(text)) {
    if (!/pinterest.com|pin.it/.test(text))
      throw "> *❌ Masukkan link Pinterest yang valid!*";
    let data = await Scraper.pinterest.download(text);
    let cap = "*– 乂 Pinterest - Downloader 📌*\n";
    cap += `> *🔹 Judul :* ${data.title}\n`;
    cap += `> *🔹 Kata Kunci :* ${data.keyword.join(", ")}\n`;
    cap += `> *🔹 Pengarang :* ${data.author.name}\n`;

    sock.sendFile(m.cht, data.download, null, cap, m);
  } else {
    let data = await Scraper.pinterest.search(text);
    let result = data.getRandom();
    let caption = "*– 乂 Pinterest - Pencarian 🔍*\n";
    caption += Object.entries(result)
      .map(([a, b]) => `> *🔹 ${a.capitalize()} :* ${b}`)
      .join("\n");

    m.reply({
      image: {
        url: result.image,
      },
      caption,
    });
  }
};

neko.command = "pinterest";
neko.alias = ["pin", "pindl"];
neko.category = ["downloader", "tools"];
neko.settings = {
  limit: true,
};
neko.description = "🔎 Mencari atau mengunduh media dari Pinterest!";
neko.loading = true;

module.exports = neko;
