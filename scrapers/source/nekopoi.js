const {
    fetch
} = require("undici");
const cheerio = require("cheerio");

class NekoPoi {
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            await fetch("https://nekopoi.care").then(async (a) => {
                let $ = cheerio.load(await a.text());
                let series = []
                let episode = []
                $(".animeseries ul li").each((a, i) => {
                    let html = $(i).find("a").attr("original-title")
                    let exec = cheerio.load(html);
                    let info = {}
                    exec(".areadetail p").each((ah, oh) => {
                        let name = exec(oh).find("b").text().trim()
                        let key = exec(oh).text().replace(name + ":", "").trim()
                        info[name.split(" ").join("_").toLowerCase().trim()] = key
                    })
                    series.push({
                        title: exec(".infoarea h2").eq(0).text(),
                        thumbnail: exec(".areabaru img").attr("src"),
                        ...info,
                        url: $(i).find("a").attr("href"),
                    })
                });
                $("#boxid .eropost").each((a, i) => {
                    episode.push({
                        title: $(i).find(".eroinfo h2 a").text().trim(),
                        release: $(i).find(".eroinfo span").eq(0).text().trim(),
                        url: $(i).find(".eroinfo h2 a").attr("href"),
                    })
                })
                resolve({
                    series,
                    episode
                });
            })
        })
    }
    detail = async function detail(url) {
        return new Promise(async (resolve, reject) => {
            await fetch(url).then(async (a) => {
                let $ = cheerio.load(await a.text());
                let result = {
                    metadata: {},
                    episode: []
                }
                $(".animeinfos .listinfo ul li").each((a, i) => {
                    let name = $(i).find("b").text().trim()
                    let key = $(i).text().trim().replace(name + ":", "").trim()
                    result.metadata[name.toLowerCase()] = key
                })
                result.metadata.thumbnail = $(".animeinfos .imgdesc img").attr("src")
                result.metadata.sinopsis = $(".animeinfos p").text()
                $(".animeinfos .episodelist ul li").each((a, i) => {
                    result.episode.push({
                        title: $(i).find("span").eq(0).find("a").text().trim(),
                        release: $(i).find("span").eq(1).text().trim(),
                        url: $(i).find("span").eq(0).find("a").attr("href")
                    })
                })
                resolve(result);
            })
        })
    }
    episode = async function episode(url) {
        return new Promise(async (resolve, reject) => {
            await fetch(url).then(async (html) => {
                const $ = cheerio.load(await html.text());
                const result = {
                    metadata: {},
                    download: []
                };
                $(".contentpost").each((ul, el) => {
                    result.metadata.title = $(el).find("img").attr("title");
                    result.metadata.images = $(el).find("img").attr("src");
                    result.metadata.synopsis = $(el)
                        .find(".konten")
                        .find("p:nth-of-type(2)")
                        .text();
                });
                result.metadata.stream = $("#show-stream").find("#stream1 iframe").attr("src");
                $(".liner").each((ul, el) => {
                    const name = $(el).find(".name").text();
                    const links = [];
                    $(el)
                        .find(".listlink a")
                        .each((j, link) => {
                            links.push({
                                name: $(link).text().trim(),
                                url: $(link).attr("href"),
                            });
                        });
                    result.download.push({
                        title: name,
                        source: links,
                    });
                });
                resolve(result);
            });
        });
    }
    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            await fetch("h*ttps://nekopoi.care/?s=" + q).then(async (html) => {
                const $ = cheerio.load(await html.text());
                const episode = [];
                $(".result ul li").each((ul, el) => {
                    const link = $(el).find("h2 a").attr("href");
                    episode.push({
                        title: $(el).find("h2 a").text().trim(),
                        type: link.split("/hentai/")[1] ? "Hentai Series" : "Hentai Episodes",
                        images: $(el).find("img").attr("src"),
                        url: link,
                    });
                });
                resolve(episode);
            });
        });
    }
}

module.exports = new NekoPoi()