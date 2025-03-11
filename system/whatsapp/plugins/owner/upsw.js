class Command {
    constructor() {
        this.command = "upsw";
        this.alias = [];
        this.category = ["owner"];
        this.settings = {
            owner: true
        };
        this.description = "Upload mdia mu ke Status WhatsApp";
        this.loading = true;
    }
    run = async (m, {
        sock,
        Func,
        Scraper,
        config,
        store
    }) => {
        let teks;
        if (m.args.length >= 1) {
            teks = m.args.slice(0).join(" ");
        } else if (m.quoted && m.quoted.body) {
            teks = m.quoted.body;
        }

        if (m.quoted && m.quoted.type) {
            const mtype = m.quoted.type;
            let type;

            if (mtype === "audioMessage") {
                type = "vn";
            } else if (mtype === "videoMessage") {
                type = "vid";
            } else if (mtype === "imageMessage") {
                type = "img";
            } else if (mtype === "extendedTextMessage") {
                type = "txt";
            } else {
                throw "❌ Media type tidak valid!";
            }

            const doc = {};

            if (type === "vn") {
                const link = await m.quoted.download()
                doc.mimetype = m.quoted.msg.mimetype;
                doc.audio = link

            } else if (type === "vid") {
                const link = await m.quoted.download();
                doc.mimetype = m.quoted.msg.mimetype;
                doc.caption = teks;
                doc.video = link
            } else if (type === "img") {
                const link = await m.quoted.download();
                doc.mimetype = m.quoted.msg.mimetype;
                doc.caption = teks;
                doc.image = link
            } else if (type === "txt") {
                doc.text = teks;
            }
            if (m.isGroup) return sock.sendStatus(doc, [m.cht])
            await sock.sendMessage("status@broadcast", doc, {
                    backgroundColor: getRandomHexColor(),
                    font: Math.floor(Math.random() * 9),
                    statusJidList: Object.keys(store.contacts),
                })
                .then((res) => {
                    m.reply(`Sukses upload ${type}`);
                })
                .catch(() => {
                    m.reply(`Gagal upload ${type}`);
                });
        } else {
            throw "❌ Tidak ada media yang diberikan!";
        }
    };
}

module.exports = new Command();