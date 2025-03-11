module.exports = {
  command: "videy",
  alias: [],
  category: ["downloader"],
  description: "Download dan upload video dari Videy",
  loading: true,
  async run(m, { sock, Func, Uploader, text }) {
    if (!text)
      throw `╭──[❌ *Cara Penggunaan*]\n᎒⊸ *\`--upload\`* Untuk upload video ke Videy\n᎒⊸ *\`https://videy.co/xxx\`* Untuk download video dari Videy\n╰────────────•`;

    if (text.includes("--upload")) {
      let q = m.quoted ? m.quoted : m;
      if (!/video/.test(q.msg.mimetype) || !q.isMedia)
        throw `> Reply/kirim video dengan caption *${m.prefix + m.command} ${text}*`;

      let buffer = await q.download();
      let hasil = await Uploader.videy(buffer);

      let cap = `╭──[📤 *Videy - Uploader*]\n᎒⊸ *Ukuran :* ${Func.formatSize(buffer.length)}\n᎒⊸ *Link :* ${hasil}\n╰────────────•`;
      m.reply(cap);
    } else {
      if (!Func.isUrl(text) || !/videy.co/.test(text))
        throw "> Masukkan link Videy yang valid!";

      let id = text.split("id=")[1];
      if (!id) throw "> Link tidak memiliki ID, coba gunakan link lain.";

      let hasil = `https://cdn.videy.co/${id}.mp4`;
      let size = await Func.getSize(hasil);
      let limit = Func.sizeLimit(size, db.list().settings.max_upload);

      if (limit.oversize)
        throw `Ukuran file terlalu besar *( ${size} )*. Upgrade ke premium untuk mendownload video hingga ukuran *1GB*!`;

      let cap = `╭──[📥 *Videy - Downloader*]\n᎒⊸ *Ukuran Video :* ${size}\n╰────────────•`;
      m.reply({
        video: { url: hasil },
        caption: cap,
      });
    }
  },
};
