const axios = require("axios");
const cheerio = require("cheerio");

class AnoBoy {
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            await axios.get('https://anoboy.io/').then((a) => {
                let $ = cheerio.load(a.data);
                let array = []
                $(".listupd .bs .bsx").each((a, i) => {
                    array.push({
                        title: $(i).find("a").attr("title"),
                        type: $(i).find("a .limit .typez").text().trim(),
                        thumbnail: $(i).find("a .limit img").attr("data-lazy-src") || "https://files.catbox.moe/qflij6.png",
                        url: $(i).find("a").attr("href")
                    })
                })
                resolve(array)
            })
        })
    }
}

module.exports = new AnoBoy();