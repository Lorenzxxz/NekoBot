const axios = require("axios");
const cheerio = require("cheerio");

async function xbox(username) {
    return new Promise(async (resolve, reject) => {
        await axios.get("https://xboxgamertag.com/search/" + encodeURIComponent(username)).then((a) => {
            let $ = cheerio.load(a.data);
            let result = {
                metadata: {},
                history: []
            }
            $(".page-header-container .page-header").each((a, i) => {
                result.metadata.name = $(i).find("h1").text().trim()
                result.metadata.icon = $(i).find("img").attr("src").split("/?url=")[1].split("&format")[0].trim();
                result.metadata.game_score = $(i).find(".profile-detail-item").eq(0).text().trim().split("\n").pop().trim()
                result.metadata.played = $(i).find(".profile-detail-item").eq(1).text().trim().split("\n").pop().trim()
            })
            $(".recent-games .game-card-container").each((a, i) => {
                result.history.push({
                    game: $(i).find(".game-card-desc h3").text().trim(),
                    online: $(i).find(".game-card-desc .text-sm").text().trim().split("played").pop().trim(),
                    game_score: $(i).find(".game-card-desc .col-9").eq(0).text().trim(),
                    achievement: $(i).find(".game-card-desc .col-9").eq(1).text().trim(),
                    progress: $(i).find(".progress .progress-bar").text().trim()
                })
            })
            resolve(result)
        })
    })
}

module.exports = xbox;