const axios = require("axios");
const cheerio = require("cheerio");
const json = require("jsonc-parser");
const {
    randomBytes
} = require('crypto');

function getRandomIp() {
    const ip = [];
    for (let i = 0; i < 4; i++) {
        ip.push(Math.floor(Math.random() * 256));
    }
    return ip.join('.');
}

async function rednote(url) {
    const randomIp = getRandomIp();
    let response = await axios.get(url, {
        headers: {
            "User-Agent": require("fake-useragent")(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
            "TE": "trailers"
        },
        timeout: 30000,
        responseType: 'document'
    });
    let html = response.data;
    let $ = cheerio.load(html);
    let jsonString;
    try {
        jsonString = $("script").last().text().split("window.__INITIAL_STATE__=")[1].replace('\\/', '/');
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    }

    let data;
    try {
        data = json.parse(removeUnicode(jsonString));
    } catch (error) {
        console.error("Error parsing JSON:", error, jsonString);
        return null;
    }


    let id = data.note.firstNoteId ? data.note.firstNoteId : data.note.currentNoteId;

    let meta = data.note.noteDetailMap[id]?.note;
    let result = {
        metadata: {
            title: meta.title,
            category: meta.tagList?.map(a => a.name),
            stats: meta.interactInfo,
            author: meta.user
        },
        download: {}
    };

    if (meta.video) {
        result.download = meta.video.media.stream['h264'][0].masterUrl;
    } else if (meta.imageList) {
        result.download = meta.imageList.map(a => a.urlDefault);
    } else {
        result.download = [];
    }
    return result;
}

function removeUnicode(jsonString) {
    return jsonString.replace(/\\u/g, '')
        .replace(/\\n/g, '\n')
        .replace(/002F/g, "/")
        .replace(/undefined/g, "null")
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\f/g, '\f')
        .replace(/\\b/g, '\b')
        .replace(/\\\\/g, '\\')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"');
}

module.exports = rednote