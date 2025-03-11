const axios = require("axios");
const cheerio = require("cheerio");

class Kuronime {
    constructor() {
        this.baseURL = "https://kuronime.biz";
    }
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://kuronime.biz").then((a) => {
                let $ = cheerio.load(a.data);
                let array = [];
                $(".listupd .bsu").each((a, i) => {
                    array.push({
                        title: $(i).find(".bsux a").attr("title"),
                        url: $(i).find(".bsux a").attr("href"),
                        views: $(i).find(".limit .view .post-views-count").text(),
                        release: $(i).find(".bt .time").text().trim() + ' yang lalu',
                        thumbnail: $(i)
                            .find(".limit .lazyload")
                            .eq(1)
                            .attr("data-src")
                            .split("?")[0],
                    });
                });
                resolve(array);
            });
        });
    };
    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://kuronime.biz?s=" + q).then((a) => {
                let $ = cheerio.load(a.data);
                let array = [];
                $(".listupd .bs").each((a, i) => {
                    array.push({
                        title: $(i).find(".bsx a").attr("title"),
                        url: $(i).find(".bsx a").attr("href"),
                        type: $(i).find(".limit .bt .type").text(),
                        score: $(i).find(".rating i").text(),
                        thumbnail: $(i)
                            .find(".limit .lazyload")
                            .eq(1)
                            .attr("data-src")
                            .split("?")[0],
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
                $(".infodetail ul li").each((a, i) => {
                    let name = $(i).find("b").text();
                    let key = $(i)
                        .text()
                        .replace(name + ":", "")
                        .split("?resize=")[0]
                        .trim();
                    array.metadata[name.split(" ").join("_").toLowerCase()] = key;
                });
                array.metadata.thumbnail = $(".con .lazyload").attr("data-src");
                array.metadata.synopis = $(".con .const p").text().trim();
                $(".bxcl ul li").each((a, i) => {
                    array.episode.push({
                        title: $(i).find(".lchx a").text(),
                        url: $(i).find(".lchx a").attr("href"),
                    });
                });
                resolve(array);
            });
        });
    };
}

module.exports = new Kuronime();