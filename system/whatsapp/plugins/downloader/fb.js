const axios = require("axios");

module.exports = {
    command: "facebook",
    alias: ["fb", "fbdl"],
    category: ["downloader"],
    settings: {
        limit: true,
    },
    description: "Unduh video dari Facebook",
    loading: true,
    async run(m, {
        sock,
        Scraper,
        Text,
        Func,
        text
    }) {
        if (!/facebook.com|fb.watch/.test(text) || !text)
            throw `*– 乂 **Cara Penggunaan** :*
> 📝 *Masukkan URL video dari Facebook yang ingin diunduh*
> 💬 *Contoh :* ${m.prefix + m.command} https://www.facebook.com/watch?v=1234567890

*– 乂 **Petunjuk Lain** :*
> ✔️ Pastikan video yang dimaksud adalah publik dan dapat diakses.
> ⚠️ Video yang dilindungi hak cipta atau terbatas mungkin tidak dapat diunduh.`;

        let data = await Scraper.facebook(text);
        let random = data.media[0];
        let buffer = await fetch(random).then(async (a) =>
            Buffer.from(await a.arrayBuffer()));

        let size = Func.formatSize(buffer.length);
        let limit = await Func.sizeLimit(size, db.list().settings.max_upload);

        if (limit.oversize)
            throw `*– 乂 **Ukuran Terlalu Besar** :*
> Video ini memiliki ukuran *( ${size} )* yang melebihi batas yang ditentukan.
> 🔓 *Upgrade ke Premium* untuk mendapatkan batas unduh hingga *1GB*.`

        let cap = `*– 乂 Informasi Video :*
> 🎥 *Judul :* ${data.metadata.title}`;

        sock.sendFile(m.cht, buffer, null, cap, m);
    },
};
