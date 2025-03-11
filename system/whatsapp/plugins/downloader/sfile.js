class Command {
    constructor() {
        this.command = "sfile";
        this.alias = ["sfilemobi"];
        this.category = ["downloader"];
        this.settings = {
            limit: true
        };
        this.description = "📁 Download file dari sfileMobi !";
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
        if (!text || !Func.isUrl(text) || !/sfile.mobi/.test(text)) throw "*❌ Input salah :* Masukan url sfileMobi !";
        let data = await Scraper.sfile(text);
        if (!data.metadata) throw "*⁉️ Media tidak ditemukan?*";
        let caption = "*SfileMobi - Downloader 📩*\n";
        caption += Object.entries(data.metadata).map(([a, b]) => `- ${a.capitalize()}: ${b}`).join("\n");
        caption += "\n\n*✅ Media Berhasil Diunduh !*\nNikmati kemudahan saat download apapun hanya di NekoBot!";
        sock.sendFile(m.cht, data.download, data.metadata.filename, caption, m, {
            mimetype: data.metadata.mimetype
        });
    };
}

module.exports = new Command();