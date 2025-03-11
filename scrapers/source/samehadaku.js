const axios = require("axios");
const cheerio = require("cheerio");

class Samehadaku {
    constructor() {
        this.url = "https://Samehadaku.email";
    }
    latest = async () => {
        return new Promise(async (resolve, reject) => {
            await axios.get(this.url).then(async (a) => {
                let $ = cheerio.load(a.data);
                let array = [];
                $(".post-show ul li").each((ul, el) => {
                    let url = $(el).find(".thumb > a").attr("href");
                    let title = $(el).find(".thumb > a").attr("alt");
                    let thumb = $(el).find(".thumb > a img").attr("src");
                    let episode = $(el).find(".dtla > span > author").eq(0).text();
                    let author = $(el).find(".dtla > span > author").eq(1).text();
                    let release = $(el)
                        .find(".dtla > span")
                        .eq(2)
                        .text()
                        .split(":")[1]
                        .trim();
                    array.push({
                        title,
                        thumb,
                        episode,
                        author,
                        release,
                        url
                    });
                });
                resolve(array);
            });
        });
    };
    search = async (q) => {
        return new Promise(async (resolve, reject) => {
            await axios.get(`${this.url}/?s=` + encodeURIComponent(q)).then((a) => {
                let $ = cheerio.load(a.data);
                let array = [];
                $(".animepost").each((ul, el) => {
                    let title = $(el).find(".animposx a").attr("alt");
                    let url = $(el).find(".animposx a").attr("href");
                    let thumbnail = $(el)
                        .find(".animposx a .content-thumb img")
                        .attr("src");
                    let type = $(el).find(".animposx a .content-thumb .type").text();
                    let score = $(el)
                        .find(".animposx a .content-thumb .score")
                        .text()
                        .trim();
                    let synopsis = $(el).find(".stooltip .ttls").html();

                    array.push({
                        title,
                        type,
                        score,
                        thumbnail,
                        url,
                        synopsis
                    });
                });
                resolve(array);
            });
        });
    };
    detail = async (url) => {
        return new Promise(async (resolve, reject) => {
            await axios
                .get(url)
                .then((a) => {
                    let $ = cheerio.load(a.data);
                    const title = $(".infox .anim-detail").text();
                    const japanese = $(".infox .spe span")
                        .eq(0)
                        .text()
                        .replace("Japanese", "")
                        .trim();
                    const synonyms = $(".infox .spe span")
                        .eq(1)
                        .text()
                        .replace("Synonyms", "")
                        .trim();
                    const english = $(".infox .spe span")
                        .eq(2)
                        .text()
                        .replace("English", "")
                        .trim();
                    const status = $(".infox .spe span")
                        .eq(3)
                        .text()
                        .replace("Status", "")
                        .trim();
                    const type = $(".infox .spe span")
                        .eq(4)
                        .text()
                        .replace("Type", "")
                        .trim();
                    const source = $(".infox .spe span")
                        .eq(5)
                        .text()
                        .replace("Source", "")
                        .trim();
                    const duration = $(".infox .spe span")
                        .eq(6)
                        .text()
                        .replace("Duration", "")
                        .trim();
                    const totalEpisode = $(".infox .spe span")
                        .eq(7)
                        .text()
                        .replace("Total Episode", "")
                        .trim();
                    const season = $(".infox .spe span").eq(8).find("a").text();
                    const studio = $(".infox .spe span").eq(9).find("a").text();
                    const released = $(".infox .spe span")
                        .eq(11)
                        .text()
                        .replace("Released:", "")
                        .trim();
                    const thumbnail = $(".thumb img").attr("src");
                    const animeDetails = {
                        title,
                        japanese,
                        synonyms,
                        english,
                        status,
                        type,
                        source,
                        duration,
                        totalEpisode,
                        season,
                        studio,
                        released,
                        thumbnail,
                    };
                    const eps = [];
                    $(".lstepsiode ul li").each((ul, el) => {
                        eps.push({
                            title: $(el).find(".epsleft span > a").text(),
                            url: $(el).find(".epsleft span > a").attr("href"),
                        });
                    });
                    resolve({
                        metadata: animeDetails,
                        episode: eps.reverse(),
                    });
                })
                .catch((err) => reject(err));
        });
    };
    episode = async (url) => {
        try {
            const {
                data
            } = await axios.get(url);
            const $ = cheerio.load(data);
            let downloadHtml = $(".download-eps").eq(0);
            let result = {};
            downloadHtml.find("ul li").each((_, el) => {
                let quality = $(el).find("strong").text().trim();
                result[quality] = [];

                $(el)
                    .find("span a")
                    .each((_, b) => {
                        result[quality].push({
                            source: $(b).text().trim(),
                            url: $(b).attr("href"),
                        });
                    });
            });
            let metadata = {};
            $(".areainfo").each((_, el) => {
                let title = $("title").text().trim();
                let genre = $(el)
                    .find(".infox .genre-info a")
                    .map((i, a) => $(a).text().trim())
                    .get();
                let thumbnail = $(el).find(".thumb img").attr("src");
                let synopsis = $(el).find(".infox .desc .entry-content").text().trim();
                metadata = {
                    title,
                    genre,
                    thumbnail,
                    synopsis
                };
            });

            return {
                metadata,
                download: result
            };
        } catch (error) {
            console.error("Error fetching episode data:", error);
            throw new Error("Unable to fetch data");
        }
    };
}
module.exports = new Samehadaku();