class Command {
  constructor() {
    this.command = "whatmusic";
    this.alias = [];
    this.category = ["tools"];
    this.settings = {
      limit: true,
    };
    this.description =
      "Cari judul lagu berdasarkan media audio yang kamu kirimkan!";
    this.loading = true;
  }

  run = async (m, { Func }) => {
    let target = m.quoted ? m.quoted : m;
    if (!/audio/.test(target.msg.mimetype))
      throw "⚠️ *Oops!* Harap balas pesan audio yang ingin dicari judul lagunya.";

    let buffer = await target.download();
    let data = await whatmusic(buffer);

    if (!data || data.length === 0)
      throw "❌ *Maaf!* Tidak dapat menemukan informasi lagu dari audio tersebut.";

    let caption = `🎵 *What Music - Finder* 🎵\n\n`;
    for (let result of data) {
      caption += `🎶 *Judul:* ${result.title}\n`;
      caption += `🎤 *Artis:* ${result.artist}\n`;
      caption += `⏱️ *Durasi:* ${result.duration}\n`;
      caption += `🔗 *Sumber:* ${result.url.filter((x) => x).join("\n") || "Tidak ditemukan"}\n\n`;
    }

    caption += `💡 *Tips:* Kirim audio dengan kualitas yang jelas untuk hasil terbaik.`;
    m.reply(caption);
  };
}

module.exports = new Command();

const acrcloud = require("acrcloud");

const acr = new acrcloud({
  host: "identify-ap-southeast-1.acrcloud.com",
  access_key: "ee1b81b47cf98cd73a0072a761558ab1",
  access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI",
});

async function whatmusic(buffer) {
  let response = await acr.identify(buffer);
  let metadata = response.metadata;
  if (!metadata || !metadata.music) return [];

  return metadata.music.map((song) => ({
    title: song.title,
    artist: song.artists.map((a) => a.name)[0],
    score: song.score,
    release: new Date(song.release_date).toLocaleDateString("id-ID"),
    duration: toTime(song.duration_ms),
    url: Object.keys(song.external_metadata)
      .map((key) =>
        key === "youtube"
          ? "https://youtu.be/" + song.external_metadata[key].vid
          : key === "deezer"
            ? "https://www.deezer.com/us/track/" +
              song.external_metadata[key].track.id
            : key === "spotify"
              ? "https://open.spotify.com/track/" +
                song.external_metadata[key].track.id
              : "",
      )
      .filter(Boolean),
  }));
}

function toTime(ms) {
  let minutes = Math.floor(ms / 60000) % 60;
  let seconds = Math.floor(ms / 1000) % 60;
  return [minutes, seconds].map((v) => v.toString().padStart(2, "0")).join(":");
}
