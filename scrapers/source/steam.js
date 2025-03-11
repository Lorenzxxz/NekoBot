const axios = require("axios");
const cheerio = require("cheerio");

class Steam {
    search = async function Steam(query) {
        let data = (
            await axios.get(
                "https://store.steampowered.com/api/storesearch?cc=id&l=id&term=" +
                query,
            )
        ).data;
        let info = data.items;

        return info.map((a) => ({
            name: a.name,
            id: a.id,
            price: a.price ? "Rp: " + (a.price.final / 1e3).toLocaleString() : "Free",
            score: a.metascore ? a.metascore + "/100" : "N/A",
            platform: a.platforms.windows ?
                "Windows" : a.platforms.mac ?
                "Mac" : a.platforms.linux ?
                "Linux" : "Nothing",
            image: a.tiny_image,
        }));
    };
    detail = async function Steam_Detail(url) {
        try {
            let data = (
                await axios.get(
                    "https://store.steampowered.com/api/appdetails?appids=" + url,
                )
            ).data;
            let info = data[url].data;
            const $ = cheerio.load(info.detailed_description);
            let json = {
                metadata: {
                    title: info.name,
                    category: info.categories.map((a) => a.description),
                    genre: info.genres.map((a) => a.description),
                    release: info.release_date.coming_soon ?
                        "Coming soon..." : info.release_date.date,
                    free: info.is_free ? "Yes" : "No",
                    developer: info.developers,
                    publisher: info.developers,
                    description: $.text(),
                },
                screenshot: info.screenshots.map((a) => a.path_full),
                movies: info.movies.map((a) => ({
                    title: a.name,
                    id: a.id,
                    thumbnail: a.thumbnail,
                    videos: a.mp4,
                })),
            };
            return json;
        } catch (err) {
            console.error(err);
        }
    };
}

module.exports = new Steam();