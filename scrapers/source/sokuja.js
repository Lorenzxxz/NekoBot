const cheerio = require("cheerio");
const axios = require("axios");

class Sokuja {
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://x1.sokuja.uk").then((a) => {
                let $ = cheerio.load(a.data);
                let array = [];
                $(".seventh").each((a, i) => {
                    array.push({
                        title: $(i).find(".main-seven a").attr("title"),
                        type: $(i).find(".main-seven .limit .bt .type").text(),
                        thumbnail: $(i).find(".main-seven .limit img").attr("src"),
                        episode: $(i).find(".main-seven .limit .epin").text(),
                        url: $(i).find(".main-seven a").attr("href"),
                    });
                });
                resolve(array);
            });
        });
    };
    search = async function Search(q) {
        return new Promise(async (resolve, reject) => {
            await axios
                .get("https://x1.sokuja.uk?s=" + encodeURIComponent(q))
                .then((a) => {
                    let $ = cheerio.load(a.data);
                    let array = [];
                    $(".listupd .bs .bsx").each((a, i) => {
                        array.push({
                            title: $(i).find("a").attr("title"),
                            type: $(i).find("a .limit .typez").text(),
                            thumbnail: $(i).find("a .limit img").attr("src"),
                            status: $(i).find("a .limit .status").text(),
                            url: $(i).find("a").attr("href"),
                        });
                    });
                    resolve(array);
                });
        });
    };
    detail = async function detail(url) {
        return new Promise(async (resolve, reject) => {
            await axios.get(url).then((a) => {
                let $ = cheerio.load(a.data);
                let array = {
                    metadata: {},
                    episode: [],
                };
                $(".infox").each((a, i) => {
                    array.metadata.title = $(i).find("h1").text();
                    $(i)
                        .find(".info-content .spe span")
                        .each((b, d) => {
                            let name = $(d).find("span b").text();
                            let key = $(d).text().replace(name, "").trim();
                            array.metadata[
                                name.toLowerCase().split(":")[0].split(" ").join("_")
                            ] = key;
                        });
                    array.metadata.thumbnail = $(".thumb img").attr("src");
                    array.metadata.sinopsis = $(".entry-content p").eq(1).text().trim();
                });
                $(".eplister ul li").each((a, i) => {
                    array.episode.push({
                        title: $(i).find(".epl-title").text(),
                        release: $(i).find(".epl-date").text(),
                        url: $(i).find("a").attr("href"),
                    });
                });
                resolve(array);
            });
        });
    };
    episode = async function episode(url) {
        return new Promise(async (resolve, reject) => {
            await axios.get(url).then((a) => {
                let $ = cheerio.load(a.data);
                let array = {
                    metadata: {},
                    downloads: {},
                };
                array.metadata.title = $(".title-section h1").text();
                array.metadata.thumbnail = $(".tb img").attr("src");
                array.metadata.updated = $(".lm .updated").text();
                $(".mirror option").each((a, i) => {
                    let exec = cheerio.load(atob($(i).attr("value")));
                    let mimetype = exec("source").attr("type");
                    let quality = $(i).text().trim().split(" ")[1];
                    let url = exec("source").attr("src");
                    if (!url) return;
                    array.downloads[quality] = {
                        quality,
                        mimetype,
                        url,
                    };
                });
                resolve(array);
            });
        });
    };
}

module.exports = new Sokuja();