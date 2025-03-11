const axios = require("axios");
const cheerio = require("cheerio");
const PDFDocument = require("pdfkit");

function h2k(integer) {
    let numb = parseInt(integer);
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
    }).format(numb);
}
async function toPDF(images, opt = {}) {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(images)) images = [images];
        let buffs = [],
            doc = new PDFDocument({
                margin: 0
            });
        let firstImageWidth = 0;
        let firstImageHeight = 0;

        if (images.length > 0) {
            try {
                let firstImageData = (await axios.get(images[0], {
                    responseType: 'arraybuffer',
                    ...opt
                })).data;
                let firstImage = doc.openImage(firstImageData);
                firstImageWidth = firstImage.width;
                firstImageHeight = firstImage.height;
            } catch (error) {
                reject(error);
                return;
            }
        }
        for (let x = 0; x < images.length; x++) {
            if (/.webp|.gif/.test(images[x])) continue;
            try {
                let data = (await axios.get(images[x], {
                    responseType: 'arraybuffer',
                    ...opt
                })).data;
                let image = doc.openImage(data);
                doc.addPage({
                    size: [image.width, image.height]
                });
                doc.image(data, 0, 0, {
                    width: image.width,
                    height: image.height
                });
            } catch (error) {
                continue;
            }
        }
        doc.on('data', (chunk) => buffs.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffs)));
        doc.on('error', (err) => reject(err));
        doc.end();
    });
}

class Komiku {
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://komiku.id").then((a) => {
                let $ = cheerio.load(a.data)
                let array = []
                $("#Terbaru .ls4w .ls4").each((a, i) => {
                    let url = "https://komiku.id/" + $(i).find("a").attr("href");
                    let title = $(i).find(".ls4j h3 a").text().trim()
                    let release = $(i).find(".ls4j .ls4s").text().trim().split(" ").slice(2).join(' ').trim();
                    let chapter = $(i).find(".ls4j .ls24").text().trim().split("Chapter")[1].trim();
                    let thumbnail = $(i).find(".lazy").attr("data-src").split("?")[0].trim();
                    array.push({
                        title,
                        release,
                        chapter,
                        thumbnail,
                        url
                    })
                })
                resolve(array)
            })
        })
    }
    detail = async function detail(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);

                let result = {
                    metadata: {},
                    chapter: []
                };

                $("#Informasi").each((a, i) => {
                    $(i).find(".inftable tr").each((u, e) => {
                        let name = $(e).find("td").eq(0).text().split(" ").join("_").toLowerCase().trim();
                        let value = $(e).find("td").eq(1).text().trim();
                        result.metadata[name] = value;
                    });
                    result.metadata.thumbnail = $(i).find("img").attr("src").split("?")[0].trim();
                });
                result.metadata.sinopsis = $("#Judul .desc").text().trim()
                $("#Daftar_Chapter tbody tr").each((a, i) => {
                    let chapter = $(i).find(".judulseries a span").text()
                    let reader = h2k(Number($(i).find(".pembaca i").text().trim()));
                    let released = $(i).find(".tanggalseries").text().trim()
                    let url = "https://komiku.id/" + $(i).find(".judulseries a").attr("href")
                    if (!chapter) return
                    result.chapter.push({
                        chapter,
                        reader,
                        released,
                        url
                    })
                })
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    chapter = async function chapter(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                let images = $("#Baca_Komik img").map((a, i) => $(i).attr("src")).get();
                let result = {
                    metadata: {},
                    buffer: {}
                };
                $(".tbl tbody tr").each((u, e) => {
                    let name = $(e).find("td").eq(0).text().split(" ").join("_").toLowerCase().trim();
                    let value = $(e).find("td").eq(1).text().trim();
                    result.metadata[name] = value;
                });
                result.buffer = await toPDF(images);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            await axios.get(`https://api.komiku.id/?post_type=manga&s=${q}`).then((a) => {
                let $ = cheerio.load(a.data);
                let array = []
                $(".bge").each((a, i) => {
                    let title = $(i).find(".kan a h3").text().trim();
                    let url = "https://komiku.id" + $(i).find(".kan a").attr("href")
                    let thumbnail = $(i).find(".bgei img").attr("src").split("?")[0].trim()
                    let synopsis = $(i).find(".kan p").text().trim().split(".")[1].trim()
                    array.push({
                        title,
                        thumbnail,
                        synopsis,
                        url
                    })
                })
                resolve(array)
            })
        })
    }
}

module.exports = new Komiku();