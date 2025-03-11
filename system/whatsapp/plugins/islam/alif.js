const axios = require("axios");
const cheerio = require("cheerio");

async function alifSearch(query) {
  try {
    const { data } = await axios.get("https://alif.id/?s=" + query);
    const $ = cheerio.load(data);
    const results = [];

    $(".post.style3").each((index, element) => {
      const title = $(element).find(".post-title h5 a span").text().trim();
      const link = $(element).find(".post-title h5 a").attr("href");
      const author = $(element).find(".post-author a").text().trim();
      const authorLink = $(element).find(".post-author a").attr("href");
      const date = $(element).find(".post-date").text().trim();
      const category =
        $(element).find(".post-category a").text().trim() ||
        "Tidak ada kategori";
      const categoryLink =
        $(element).find(".post-category a").attr("href") ||
        "Tidak ada link kategori";
      const image =
        $(element).find("figure.post-gallery img").attr("data-src") ||
        "Tidak ada gambar";

      results.push({
        title,
        link,
        author,
        authorLink,
        date,
        category,
        categoryLink,
        image,
      });
    });

    return results.length > 0 ? results : null;
  } catch (error) {
    throw new Error(
      "Gagal mengambil data dari Alif.id. Pastikan koneksi Anda stabil.",
    );
  }
}

class Command {
  constructor() {
    this.command = "alif";
    this.alias = [];
    this.category = ["islam"];
    this.settings = { limit: true };
    this.description = "🔍 Cari informasi Islami dari Alif.id";
    this.loading = true;
  }

  run = async (m, { text }) => {
    if (!text) throw "> Masukkan kata kunci untuk pencarian.";
    try {
      let data = await alifSearch(text);
      if (!data) throw "> Tidak ada hasil ditemukan untuk pencarian Anda.";

      let caption = `*– 乂 Alif - Pencarian*\n\n`;
      caption += data
        .map(
          (item, index) =>
            `*${index + 1}. ${item.title}*\n> 🔗 *Link:* ${item.link}\n> ✍️ *Penulis:* [${item.author}](${item.authorLink})\n> 📅 *Tanggal:* ${item.date}\n> 🗂️ *Kategori:* [${item.category}](${item.categoryLink})\n> 🖼️ *Gambar:* ${item.image}`,
        )
        .join("\n\n");

      m.reply(caption);
    } catch (error) {
      m.reply(`> Terjadi kesalahan:\n${error.message}`);
    }
  };
}

module.exports = new Command();
