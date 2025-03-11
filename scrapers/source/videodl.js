const axios = require("axios")
const cheerio = require("cheerio");

async function videodl(url) {
    return new Promise(async (resolve, reject) => {
        await axios.get(`https://videodownloader.so/download?v=${url}`).then((a) => {
            let $ = cheerio.load(a.data);
            let result = {
                metadata: {},
                download: []
            }
            $(".downloadSection").each((a, i) => {
                result.metadata.title = $(i).find(".title").text().trim();
                result.metadata.thumbnail = $(i).find("img").attr("src");
                result.metadata.duration = $(i).find(".duration").text().trim().split("Duration:").pop().trim()
            })
            $(".downloadsTable").eq(0).find("tbody tr").each((a, i) => {
                let fileName = $(i).find("td").find(".downloadBtn").attr("download");
                if (!fileName) return
                result.download.push({
                    fileName,
                    url: $(i).find(".downloadBtn").attr("href"),
                })
            })
            resolve(result)
        })
    })
}

module.exports = videodl