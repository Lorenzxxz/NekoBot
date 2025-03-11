const cheerio = require("cheerio");
const {
    fetch
} = require("undici");
const {
    lookup
} = require("mime-types");
async function mediafire(url) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const type = $(".dl-btn-cont").find(".icon").attr("class").split("archive")[1].trim();
        const filename = $(".dl-btn-label").attr("title");
        const size = $('.download_link .input').text().trim().match(/\((.*?)\)/)[1];
        const ext = filename.split(".").pop();
        const mimetype =
            lookup(ext.toLowerCase()) || "application/" + ext.toLowerCase();
        const download = $(".input").attr("href");
        resolve({
            filename,
            type,
            size,
            ext,
            mimetype,
            download,
        });
    }).catch((e) =>
        reject({
            msg: "Gagal mengambil data dari link tersebut",
        }),
    );
}

module.exports = mediafire;