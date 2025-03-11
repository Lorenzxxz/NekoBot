const axios = require("axios");
const cheerio = require("cheerio");

class Pinterest {
    search = async function(query) {
        const queryParams = {
                source_url: "/search/pins/?q=" + encodeURIComponent(query),
                data: JSON.stringify({
                    options: {
                        isPrefetch: !1,
                        query: query,
                        scope: "pins",
                        no_fetch_context_on_resource: !1,
                    },
                    context: {},
                }),
                _: Date.now(),
            },
            url = new URL("https://www.pinterest.com/resource/BaseSearchResource/get/");
        Object.entries(queryParams).forEach((entry) =>
            url.searchParams.set(entry[0], entry[1]),
        );
        try {
            const json = await (await fetch(url.toString())).json();
            return json.resource_response.data.results
                .filter((a) => a.title !== "")
                .map((a) => ({
                    title: a.title,
                    id: a.id,
                    create_at: require("moment-timezone")(
                        new Date(a.created_at) * 1,
                    ).format("DD/MM/YYYY HH:mm:ss"),
                    author: a.pinner.username,
                    followers: a.pinner.follower_count.toLocaleString(),
                    source: "https://www.pinterest.com/pin/" + a.id,
                    image: a.images["orig"].url,
                }));
        } catch (error) {
            return console.error("Error mengambil data:", error), [];
        }
    }
    download = async function(url) {
        try {
            let response = await axios
                .get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                    },
                })
                .catch((e) => e.response);
            let $ = cheerio.load(response.data);
            let tag = $('script[data-test-id="video-snippet"]');
            if (tag.length > 0) {
                let result = JSON.parse(tag.text());
                if (
                    !result ||
                    !result.name ||
                    !result.thumbnailUrl ||
                    !result.uploadDate ||
                    !result.creator
                ) {
                    return {
                        msg: "- Data tidak ditemukan, coba pakai url lain"
                    };
                }
                return {
                    title: result.name,
                    thumb: result.thumbnailUrl,
                    upload: new Date(result.uploadDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }),
                    source: result["@id"],
                    author: {
                        name: result.creator.alternateName,
                        username: "@" + result.creator.name,
                        url: result.creator.url,
                    },
                    keyword: result.keywords ?
                        result.keywords.split(", ").map((keyword) => keyword.trim()) :
                        [],
                    download: result.contentUrl,
                };
            } else {
                let json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
                let result = json.response.data["v3GetPinQuery"].data;
                return {
                    title: result.title,
                    upload: new Date(result.createAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }),
                    source: result.link,
                    author: {
                        name: result.pinner.username,
                        username: "@" + result.pinner.username,
                    },
                    keyword: result.pinJoin.visualAnnotation,
                    download: result.imageLargeUrl,
                };
            }
        } catch (e) {
            return {
                msg: "Error coba lagi nanti"
            };
        }
    };
}

module.exports = new Pinterest();