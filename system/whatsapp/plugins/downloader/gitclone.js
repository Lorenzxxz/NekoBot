const axios = require("axios");

const regex =
  /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+?)(?:[\/]|$)/i;

module.exports = {
  command: "gitclone",
  alias: ["gitdl", "githubdl"],
  settings: {
    limit: true,
  },
  description: "Download repository dari github",
  loading: true,
  async run(m, { sock, Func, text }) {
    if (!Func.isUrl(text) && !/github.com/.test(text))
      throw `*– 乂 Cara Penggunaan :*
> 📝 *Masukkan URL repository GitHub yang ingin diunduh*
> 💬 *Contoh :* ${m.prefix + m.command} https://github.com/user/repository

*– 乂 Petunjuk Lain :*
> ✔️ Pastikan URL yang dimasukkan adalah link valid dari repository GitHub.`;

    let [_, author, repo] = text.match(regex);
    if (!author || !repo)
      throw "*– 乂 Masukkan Link Repository :*\n> Link repository tidak valid atau tidak ditemukan!";

    repo.replace(/.git$/, "");
    let api = `https://api.github.com/repos/${author}/${repo}`;
    let { data } = await axios.get(api).catch((e) => e.response);

    let cap = `*– 乂 Github Repository Info :*\n`;
    cap += `> *- Nama :* ${data.name}\n`;
    cap += `> *- Pemilik :* ${data.owner.login}\n`;
    cap += `> *- Bahasa Pemrograman :* ${data.language}\n`;
    cap += `> *- Total Star :* ${Func.h2k(data.watchers)} ⭐\n`;
    cap += `> *- Total Forks :* ${Func.h2k(data.forks)} 🍴\n`;
    cap += `> *- Dibuat Pada :* ${Func.ago(data.created_at)}\n`;
    cap += `> *- Terakhir Diperbarui :* ${Func.ago(data.updated_at)}\n`;
    cap += `\n> 📜 *Deskripsi:* ${data.description || "*Tidak ada deskripsi yang tersedia*"}\n`;

    m.reply({
      document: {
        url: api + "/zipball",
      },
      caption: cap,
      fileName: `${repo}.zip`,
      mimetype: "application/zip",
    });
  },
};
