const axios = require("axios");
const cheerio = require("cheerio");

class ZenlessZone {
    list = async function list_chara() {
        return new Promise(async (resolve, reject) => {
            await axios.get("https://genshin.gg/zzz").then((res) => {
                const $ = cheerio.load(res.data);
                const chara = [];
                $(".character-list a").each((i, a) => {
                    chara.push({
                        name: $(a).find("h2").text(),
                        image: $(a).find("img").attr("src"),
                        role: $(a).find(".character-type").attr("alt"),
                        url: "https://genshin.gg/zzz" + $(a).attr("href"),
                    });
                });
                resolve(chara);
            });
        });
    };
    chara = async function character(chara) {
        return new Promise(async (resolve, reject) => {
            await axios
                .get(
                    `https://genshin.gg/zzz/characters/${encodeURIComponent(chara.toLowerCase().split(" ").join(""))}/`,
                )
                .then((response) => {
                    const $ = cheerio.load(response.data);
                    const data = {
                        info: {
                            name: $(".character-info-portrait").attr("alt"),
                            element: $(".character-info-element").attr("alt"),
                            image: $(".character-info-portrait").attr("src"),
                        },
                        paths: [],
                        stats: [],
                        team: [],
                        skills: [],
                        talents: [],
                    };

                    $(".character-info-path").each((i, el) => {
                        data.paths.push(
                            $(el).find(".character-info-path-icon").attr("alt"),
                        );
                    });

                    $(".character-info-stat").each((i, el) => {
                        data.stats.push({
                            name: $(el).find(".character-info-stat-name").text(),
                            value: $(el).find(".character-info-stat-value").text(),
                        });
                    });

                    $(".character-portrait").each((i, el) => {
                        const name = $(el).find(".character-name").text();
                        const rarity = $(el)
                            .find(".character-icon")
                            .attr("class")
                            .split(" ")[1];
                        const element = $(el).find(".character-type").attr("alt");
                        const role = $(el).find(".character-weapon").attr("alt");
                        const image = $(el).find("img").attr("src");

                        data.team.push({
                            name,
                            rarity,
                            element,
                            role,
                            image,
                        });
                    });

                    $("#skills .character-info-skill").each((i, el) => {
                        const skill = {};
                        skill.name = $(el).find(".character-info-skill-name").text();
                        skill.description = $(el)
                            .find(".character-info-skill-description")
                            .text();
                        data.skills.push(skill);
                    });

                    $("#talents .character-info-skill").each((i, el) => {
                        const talent = {};
                        talent.name = $(el).find(".character-info-skill-name").text();
                        talent.description = $(el)
                            .find(".character-info-skill-description")
                            .text();
                        data.talents.push(talent);
                    });

                    resolve(data);
                });
        });
    };
}
module.exports = new ZenlessZone();