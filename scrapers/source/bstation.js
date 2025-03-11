const axios = require("axios");
const cheerio = require("cheerio");

class Bstation {
    search = async function search(q) {
        let {
            data
        } = await axios
            .get(
                "https://www.bilibili.tv/id/search-result?q=" + encodeURIComponent(q),
            )
            .catch((e) => e.response);
        let $ = cheerio.load(data);
        let result = [];
        $(".bstar-video-card__text-wrap").each((index, element) => {
            const userName = $(element)
                .find(".bstar-video-card__nickname span")
                .text();
            const videoTitle = $(element).find(".highlights").text();
            const videoViews = $(element)
                .find(".bstar-video-card__desc")
                .text()
                .trim();
            const userAvatar = $(element).find("img.bstar-image__img").attr("src");
            const videoElement = $(element)
                .closest(".bstar-video-card")
                .find(".bstar-video-card__cover-wrap");
            const videoLink = videoElement.find("a").attr("href");
            const videoThumbnail = videoElement
                .find("img.bstar-image__img")
                .attr("src");
            const videoDuration = videoElement
                .find(".bstar-video-card__cover-mask-text--bold")
                .text();
            if (!videoTitle) return new Error("result not found !");
            result.push({
                title: videoTitle,
                views: videoViews,
                url: "https:" + videoLink,
                tumbnail: videoThumbnail,
                duration: videoDuration,
                author: {
                    name: userName,
                    avatar: userAvatar,
                },
            });
        });
        return result;
    };
    download = async function download(url) {
        try {
            let aid = /\/video\/(\d+)/.exec(url)[1];
            const appInfo = await axios.get(url).then((res) => res.data);
            const $ = cheerio.load(appInfo);
            const title = $('meta[property="og:title"]')
                .attr("content")
                .split("|")[0]
                .trim();
            const locate = $('meta[property="og:locale"]').attr("content");
            const description = $('meta[property="og:description"]').attr("content");
            const type = $('meta[property="og:video:type"]').attr("content");
            const cover = $('meta[property="og:image"]').attr("content");
            const like = $(
                ".interactive__btn.interactive__like .interactive__text",
            ).text();
            const views = $(".bstar-meta__tips-left .bstar-meta-text").first().text();
            let data = (
                await axios
                .post(
                    "https://c.blahaj.ca/", {
                        url: url,
                    }, {
                        headers: {
                            Accept: "application/json",
                            "Content-type": "application/json",
                        },
                    },
                )
                .catch((e) => e.response)
            ).data;
            console.log(data);
            if (!data.url) new Error("! Failed to Download");
            return {
                metadata: {
                    title: title,
                    locate: locate,
                    thumbnail: cover,
                    like: like,
                    view: views,
                },
                download: {
                    url: data.url,
                    filename: data.filename,
                    type: type,
                },
            };
        } catch (e) {
            return e;
        }
    };
}

module.exports = new Bstation();