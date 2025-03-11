class Command {
    constructor() {
        this.command = "rednote";
        this.alias = ["xiaohongshu"];
        this.category = ["downloader"];
        this.settings = {
            limit: true
        };
        this.description = "🟥 Download video/slide photo dari rednote";
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
        if (!text || !Func.isUrl(text) || !/xhslink.com|xiaohongshu.com/.test(text)) throw "*❌ Masukan Input :* Masukan Url dari Xiaohongshu/Rednote"

        let data = await Scraper.rednote(text);
        if (!data.metadata) throw "*⁉️⁉️ Media tidak ditemukan*"
        let caption = "*Xiaohongshu - Downloader 📩*\n"
        caption += `*🔻 Title :* ${data.metadata.title}\n`
        caption += `\n*📈 Statistik :*\n`
        caption += Object.entries(data.metadata.stats).map(([a, b]) => `- ${a.capitalize()} : ${b}`).join("\n")
        caption += `\n\n*👤 Info Pemilik :*\n`
        caption += Object.entries(data.metadata.author).map(([a, b]) => `- ${a.capitalize()} : ${b}`).join("\n")
        caption += "\n\n*✅ Media Berhasil Diunduh !*\n📨 Nikmati kemudahan mendownload video rednote hanya di NekoBot"

        if (typeof data.download == "object") {
            for (let img of data.download) {
                sock.sendFile(m.cht, img, null, caption, m);
            }
        } else {
            sock.sendFile(m.cht, data.download, null, caption, m);
        }
    };
}

module.exports = new Command();