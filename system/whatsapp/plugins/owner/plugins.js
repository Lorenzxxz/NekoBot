const fs = require("fs");
const jsBeautify = require("js-beautify");

module.exports = {
  command: "plugins",
  alias: ["plugin"],
  category: ["owner"],
  settings: {
    owner: true,
  },
  description: "Pengelolaan dan Pengaturan Plugins Bot dengan Mudah",
  async run(m, { text }) {
    let src = pg.plugins;

    if (!text)
      throw `> *– 乂 Panduan Penggunaan Perintah* 💡\n
            > 1. Gunakan *\`--get\`* untuk mengambil plugin\n
            > 2. Gunakan *\`--add\`* untuk menambahkan plugin baru\n
            > 3. Gunakan *\`--delete\`* untuk menghapus plugin\n\n
            > *– 乂 Daftar Plugin yang Tersedia :*\n
            ${Object.keys(src)
              .map((a, i) => `> *${i + 1}.* ${a.split("/plugins/")[1]}`)
              .join("\n")}`;

    if (text.includes("--get")) {
      let input = text.replace("--get", "").trim();
      if (!input)
        throw `> Mohon pilih plugin dengan menyertakan nomor atau nama plugin.`;

      let list = Object.keys(src).map((a) => a.split("/plugins/")[1]);
      let file = isNaN(input)
        ? `${pg.directory}/${input}.js`
        : `${pg.directory}/${list[parseInt(input) - 1]}`;

      try {
        m.reply(fs.readFileSync(file.trim()).toString());
      } catch (e) {
        m.reply(
          `> *Plugin ${input} tidak ditemukan.* Pastikan plugin yang kamu cari tersedia.`,
        );
      }
    } else if (text.includes("--add")) {
      if (!m.quoted || !m.quoted.body)
        throw `> *– 乂 Mohon balas pesan berisi kode plugin yang ingin kamu simpan.*\n
                > Harap pastikan bahwa kode plugin yang kamu kirim valid dan lengkap!`;

      let input = text.replace("--add", "").trim();
      if (!input) throw `> Masukkan nama plugin yang ingin kamu tambahkan.`;

      try {
        let file = `${pg.directory}/${input}.js`;
        fs.writeFileSync(file.trim(), jsBeautify(m.quoted.body));
        m.reply(`> 🎉 *Plugin ${input} berhasil disimpan!*`);
      } catch (e) {
        m.reply(
          `> *Terjadi kesalahan saat menyimpan plugin.* Coba periksa kode plugin atau coba lagi nanti.`,
        );
      }
    } else if (text.includes("--delete")) {
      let input = text.replace("--delete", "").trim();
      if (!input)
        throw `> Silakan masukkan nama atau nomor plugin yang ingin kamu hapus.`;

      let list = Object.keys(src).map((a) => a.split("/plugins/")[1]);
      let file = isNaN(input)
        ? `${pg.directory}/${input}.js`
        : `${pg.directory}/${list[parseInt(input) - 1]}`;

      try {
        fs.unlinkSync(file.trim());
        m.reply(`> 🗑️ *Plugin ${input} berhasil dihapus dari daftar plugin.*`);
      } catch (e) {
        m.reply(
          `> *Plugin ${input} tidak ditemukan.* Pastikan nama plugin yang kamu masukkan benar.`,
        );
      }
    } else {
      throw `> *– 乂 Panduan Penggunaan Perintah* 💡\n
            > 1. Gunakan *\`--get\`* untuk mengambil plugin\n
            > 2. Gunakan *\`--add\`* untuk menambahkan plugin baru\n
            > 3. Gunakan *\`--delete\`* untuk menghapus plugin\n\n
            > *– 乂 Daftar Plugin yang Tersedia :*\n
            ${Object.keys(src)
              .map((a, i) => `> *${i + 1}.* ${a.split("/plugins/")[1]}`)
              .join("\n")}`;
    }
  },
};
