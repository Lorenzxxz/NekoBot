const {
    fetch
} = require("undici");

class Command {
    constructor() {
        this.command = "soundcloud";
        this.alias = ["sound", "scloud"];
        this.category = ["downloader"];
        this.settings = {
            limit: true,
        };
        this.description = "🎵 Mencari dan mengunduh musik dari SoundCloud!";
        this.loading = true;
    }
    run = async (m, {
        sock,
        Func,
        Scraper,
        config,
        store,
        text
    }) => {
        if (!text)
            throw (
                `*– 乂 Cara Penggunaan 🎶*\n\n` +
                `> Masukkan kata kunci untuk mencari musik\n` +
                `> Masukkan URL SoundCloud untuk mengunduh musik\n\n` +
                `*– 乂 Contoh Penggunaan 📋*\n` +
                `> ${m.prefix}soundcloud Imagine Dragons\n` +
                `> ${m.prefix}soundcloud https://soundcloud.com/artist-name/track-name`
            );

        if (Func.isUrl(text)) {
            if (!/soundcloud.com/.test(text))
                throw `> *❌ Masukkan URL SoundCloud yang valid!*`;

            let data = await Scraper.soundcloud.download(text);
            if (!data.download) throw Func.jsonFormat(data);
            let buffer = await fetch(data.download);
            let cap = `*– 乂 SoundCloud - Downloader 🎵*\n\n`;
            cap += Object.entries(data)
                .map(([a, b]) => `> *🎧 ${a.capitalize()} :* ${b}`)
                .join("\n");

            sock.sendMessage(m.cht, {
                image: {
                    url: data.thumbnail
                },
                caption: cap
            }, {
                quoted: m
            }).then((msg) => {
                setTimeout(() => {
                    sock.sendMessage(m.cht, {
                        audio: {
                            url: data.download
                        },
                        mimetype: "audio/mpeg",
                    }, {
                        quoted: msg
                    });
                }, 4000);
            })
        } else {
            let data = await Scraper.soundcloud.search(text);
            if (data.length === 0) throw `> *❌ Musik tidak ditemukan!*`;

            let cap =
                `*– 乂 SoundCloud - Pencarian 🔎*\n\n` +
                `> Pilih lagu yang ingin kamu unduh!\n\n`;
            cap += data
                .map((i) => `> *🎵 Judul :* ${i.title}\n` + `> *🔗 URL :* ${i.url}`)
                .join("\n\n");

            m.reply(cap);
        }
    };
}

module.exports = new Command();