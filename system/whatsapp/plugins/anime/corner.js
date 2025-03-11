const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  command: "animecorner",
  alias: ["corner"],
  category: ["anime"],
  settings: {
    limit: true
  },
  description: "Search atau Cari Detail Anime dengan Corner",
  async run(m, { text, sock }) {
    if (!text) {
      return m.reply("Perintah Tidak Valid\nGunakan:\n> animecorner `--search` spy x family\n> animecorner `--detail` <link>");
    }
    
    try {
      if (text.startsWith('--search')) {
        const query = text.replace('--search', '').trim();
        const data = await CorNer.search(query);

        if (data.length === 0) {
          return m.reply("Anime tidak ditemukan. Coba lagi dengan kata kunci lain.");
        }

        const ress = data[0];
        let { title, link, author, date, description, image } = ress;

        if (image) {
          image = image.replace(/url['"]?(.*?)['"]?/, '$1'); // Regex untuk menghapus url() dan tanda kutip
        }

        let message = `
*🔍 Judul*: ${title}
*🌐 Link*: ${link}
*📝 Penulis*: ${author}
*📅 Tanggal*: ${date}
*📜 Deskripsi*: ${description}
*🖼️ Gambar*: ${image ? image : 'Tidak ada gambar'}

Gunakan perintah \`animecorner --detail <link>\` untuk melihat detail lebih lanjut.
        `;

        m.reply(message);
      }

      if (text.startsWith('--detail')) {
        const url = text.replace('--detail', '').trim();
        if (!url) return m.reply("Link tidak ditemukan. Harap masukkan link anime yang valid.");

        const details = await CorNer.detail(url);
        
        if (Object.keys(details).length === 0) {
          return m.reply("Gagal mengambil detail anime. Coba lagi.");
        }

        const { title, author, date, content } = details;

        // Memastikan hanya satu tanggal yang ditampilkan
        const formattedDate = date ? date.split(',')[0] : 'Tidak ada tanggal'; // Hanya mengambil tanggal pertama jika ada lebih dari satu tanggal

        let detailMessage = `
*📖 Detail Anime*

*🔹 Judul*: ${title}
*🔹 Penulis*: ${author}
*🔹 Tanggal*: ${formattedDate}
*🔹 Konten*: ${content}

Semoga bermanfaat! 😊
        `;

        m.reply(detailMessage);
      }

    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      m.reply("Terjadi kesalahan saat memproses permintaan. Coba lagi nanti.");
    }
  }
}

const CorNer = {
  search: async (text) => {
    try {
      const ress = await axios.get(`https://animecorner.me/?s=${text}`);
      const $ = cheerio.load(ress.data);
      const results = [];

      $('ul.penci-wrapper-data.penci-grid li.list-post').each((index, element) => {
        const title = $(element).find('h2.penci-entry-title a').text().trim();
        const link = $(element).find('h2.penci-entry-title a').attr('href');
        const author = $(element).find('.author-italic a').text().trim();
        const date = $(element).find('.entry-date').text().trim();
        const description = $(element).find('.item-content p').text().trim();

        const imageContainer = $(element).find('.thumbnail div.acwp-image-placeholder-container');
        let image = 
          imageContainer.attr('data-bgset') ||
          imageContainer.css('background-image')?.replace(/url\'?|\'?/g, '').trim(); // Memperbaiki pengambilan gambar dengan regex

        if (title && link) {
          results.push({ title, link, author, date, description, image });
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return [];
    }
  }, 

  detail: async (url) => {
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      const title = $('h1.single-post-title.entry-title').text().trim();
      const author = $('.author-post .author-url').text().trim();
      const date = $('.entry-date').text().trim();
      const content = $('.post-entry .entry-content').text().trim();

      return { title, author, date, content };
    } catch (error) {
      console.error('Error fetching detail:', error.message);
      return {};
    }
  }
};