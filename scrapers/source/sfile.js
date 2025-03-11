const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (url) => {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47",
        Referer: url,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    };
    const {
        data: info,
        headers: responseHeaders
    } = await axios.get(url, {
        headers: headers,
    }).catch(e => e.response);
    const cookies =
        responseHeaders["set-cookie"]
        ?.map((cookie) => cookie.split(";")[0])
        .join("; ") || "";
    headers.Cookie = cookies;
    let $ = cheerio.load(info);
    let result = {
        metadata: {},
        download: {}
    }
    $(".file-content").eq(0).each((a, i) => {
        result.metadata.filename = $(i).find("img").attr("alt")
        result.metadata.mimetype = $(i).find(".list").eq(0).text().trim().split("-")[1].trim()
        result.metadata.uploaded = $(i).find(".list").eq(2).text().trim().split(":")[1].trim()
        result.metadata.download = $(i).find(".list").eq(3).text().trim().split(":")[1].trim()
        result.metadata.author = $(i).find(".list").eq(1).find("a").text().trim()
    })
    let downloadUrl = $("#download").attr("href")
    headers.Referer = downloadUrl
    let {
        data: process
    } = await axios.get(downloadUrl, {
        headers
    }).catch(e => e.response);
    $ = cheerio.load(process);
    let key = $("#download").attr("onclick")
    let {
        data: buffer
    } = await axios.get($("#download").attr("href") + "&k=" + key.split("'+'")[1].split("';")[0], {
        headers,
        responseType: "arraybuffer"
    })
    result.download = buffer
    return result
}