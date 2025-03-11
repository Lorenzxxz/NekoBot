const acrcloud = require("acrcloud");

const acr = new acrcloud({
    host: "identify-ap-southeast-1.acrcloud.com",
    access_key: "ee1b81b47cf98cd73a0072a761558ab1",
    access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI",
});

async function whatmusic(buffer) {
    let data = (await acr.identify(buffer)).metadata;
    if (!data.music) return res.error("Song data not found!");
    let array = [];
    array.push(
        ...data?.music?.map((a) => ({
            title: a.title,
            artist: a.artists.map((a) => a.name)[0],
            score: a.score,
            release: new Date(a.release_date).toLocaleString("id-ID").split(",")[0].trim(),
            duration: toTime(a.duration_ms),
            url: Object.keys(a.external_metadata).map((i) =>
                i === "youtube" ?
                "https://youtu.be/" + a.external_metadata[i].vid :
                i === "deezer" ?
                "https://www.deezer.com/us/track/" +
                a.external_metadata[i].track.id :
                i === "spotify" ?
                "https://open.spotify.com/track/" +
                a.external_metadata[i].track.id :
                "",
            ),
        })),
    );
    return array
}

function toTime(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}

module.exports = whatmusic