const axios = require("axios");
const yts = require("yt-search");

class YTDL {
  static #AUDIO = ["92", "128", "256", "320"];
  static #VIDEO = ["144", "360", "480", "720", "1080"];
  static #CDN = "cdn54.savetube.su";

  static #getId(url) {
    const regex =
      /(?:v=|be\/|shorts\/|embed\/|v%3D|vi?\/|u\/\w\/|attribution_link\?a=.*?v%3D|^)([\w-]{11})/;
    return url.match(regex)?.[1] || null;
  }

  static async #getMetadata(videoId) {
    const data = await yts({ videoId });
    return data;
  }

  static async #savetube(link, quality, type) {
    try {
      const headers = {
        accept: "*/*",
        referer: "https://ytshorts.savetube.me/",
        origin: "https://ytshorts.savetube.me/",
        "user-agent": "Postify/1.0.0",
        "Content-Type": "application/json",
      };

      const {
        data: { data: info },
      } = await axios.post(
        `https://${this.#CDN}/info`,
        { url: link },
        { headers: { ...headers, authority: this.#CDN } },
      );

      const {
        data: { data: dl },
      } = await axios.post(
        `https://${this.#CDN}/download`,
        {
          downloadType: type,
          quality,
          key: info.key,
        },
        { headers: { ...headers, authority: this.#CDN } },
      );

      return {
        url: dl.downloadUrl,
        quality: `${quality}${type === "audio" ? "kbps" : "p"}`,
        filename: `${info.title.replace(/[<>:"/\\|?*]/g, "")} (${quality}${type === "audio" ? "kbps" : "p"}).${type === "audio" ? "mp3" : "mp4"}`,
      };
    } catch {
      return null;
    }
  }

  static async #vreden(videoId, type) {
    try {
      const { data } = await axios.get(
        `https://ytdl.vreden.web.id/metadata?url=https://www.youtube.com/watch?v=${videoId}`,
      );
      return {
        url: type === "audio" ? data.downloads.audio : data.downloads.video,
        quality: type === "audio" ? "128kbps" : "360p",
        filename: `${data.details.title.replace(/[<>:"/\\|?*]/g, "")} (${type === "audio" ? "128kbps" : "360p"}).${type === "audio" ? "mp3" : "mp4"}`,
      };
    } catch {
      return null;
    }
  }

  static async get(cmd, ...args) {
    try {
      switch (cmd.toLowerCase()) {
        case "video": {
          const [url, quality = 360] = args;
          const videoId = this.#getId(url);
          if (!videoId) throw new Error("Invalid URL");

          const metadata = await this.#getMetadata(videoId);
          const q = this.#VIDEO.includes(quality.toString()) ? quality : 360;
          const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

          const main = await this.#savetube(ytUrl, q, "video");
          const backup = main || (await this.#vreden(videoId, "video"));
          if (!backup) throw new Error("No download source available");

          return {
            metadata: {
              title: metadata.title,
              description: metadata.description,
              duration: metadata.duration.timestamp,
              views: metadata.views,
              thumbnail: metadata.thumbnail,
              channel: metadata.author.name,
            },
            download: {
              ...backup,
              availableQualities: this.#VIDEO,
            },
          };
        }

        case "audio": {
          const [url, quality = 128] = args;
          const videoId = this.#getId(url);
          if (!videoId) throw new Error("Invalid URL");

          const metadata = await this.#getMetadata(videoId);
          const q = this.#AUDIO.includes(quality.toString()) ? quality : 128;
          const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

          const main = await this.#savetube(ytUrl, q, "audio");
          const backup = main || (await this.#vreden(videoId, "audio"));
          if (!backup) throw new Error("No download source available");

          return {
            metadata: {
              title: metadata.title,
              duration: metadata.duration.timestamp,
              views: metadata.views,
              thumbnail: metadata.thumbnail,
              channel: metadata.author.name,
            },
            download: {
              ...backup,
              availableQualities: this.#AUDIO,
            },
          };
        }

        case "search": {
          const [query] = args;
          const results = (await yts(query)).videos;
          return results.map((video) => ({
            title: video.title,
            url: video.url,
            duration: video.duration.timestamp,
            views: video.views,
            channel: video.author.name,
            thumbnail: video.thumbnail,
          }));
        }

        case "transcript": {
          const [url] = args;
          const videoId = this.#getId(url);
          const { data } = await axios.get(
            "https://ytb2mp4.com/api/fetch-transcript",
            {
              params: { url: `https://www.youtube.com/watch?v=${videoId}` },
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
                Referer: "https://ytb2mp4.com/youtube-transcript",
              },
            },
          );
          return data.transcript;
        }

        default:
          throw new Error("Invalid command");
      }
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = YTDL;
