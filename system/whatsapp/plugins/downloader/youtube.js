const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fetch = require("node-fetch");

async function ytmp3(url) {
    try {
        const {
            videoDetails
        } = await ytdl.getInfo(url, {
            lang: "id"
        });
        const stream = await ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio"
        });

        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));

        await new Promise((resolve, reject) => {
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        const buffer = Buffer.concat(chunks);
        return {
            meta: {
                title: videoDetails.title,
                channel: videoDetails.author.name,
                seconds: videoDetails.lengthSeconds,
                description: videoDetails.description,
                image: videoDetails.thumbnails.slice(-1)[0].url,
            },
            buffer: buffer,
            size: buffer.length,
        };
    } catch (error) {
        throw error;
    }
}

async function ytmp4(url) {
    try {
        const videoInfo = await ytdl.getInfo(url, {
            lang: "id"
        });
        const format = videoInfo.formats.find(f => f.hasVideo && f.hasAudio && f.qualityLabel);

        if (!format) throw new Error("Format video tidak ditemukan.");

        let response = await require("node-fetch").fetch(format.url, {
            method: "HEAD"
        });
        let fileSizeInBytes = parseInt(response.headers.get("content-length"));

        return {
            title: videoInfo.videoDetails.title,
            thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0].url,
            date: videoInfo.videoDetails.publishDate,
            duration: `${Math.floor(videoInfo.videoDetails.lengthSeconds / 60)} menit`,
            channel: videoInfo.videoDetails.ownerChannelName,
            quality: format.qualityLabel,
            contentLength: fileSizeInBytes,
            description: videoInfo.videoDetails.description,
            videoUrl: format.url
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    command: "yt",
    alias: ["yt"],
    category: ["downloader"],
    settings: {
        limit: true
    },
    description: "Mendownload video atau audio dari YouTube",
    async run(m, {
        sock,
        text,
        config
    }) {
        sock.yt = sock.yt || {};
        if (!text) return m.reply(`╭──[❌ *Masukkan Input yang Valid* ]
᎒⊸ Ketik teks untuk mencari video YouTube, atau masukkan link YouTube yang valid.
᎒⊸ Contoh: *${m.prefix + m.command} Lathi* atau *${m.prefix + m.command} https://youtu.be/abc123*
╰────────────•`);

        let isAudio = text.includes("--audio");
        let isVideo = text.includes("--video");

        let videoUrl;
        if (text.startsWith("http")) {
            videoUrl = text;
        } else {
            let search = await yts(text);
            if (!search.videos.length) return m.reply("❌ Video tidak ditemukan!");
            videoUrl = search.videos[0].url;
        }

        sock.yt[m.sender] = {
            url: videoUrl
        };

        let video = await ytmp4(sock.yt[m.sender]?.url || videoUrl);
        let metadata = {
            "📌 Judul": video.title,
            "📺 Channel": video.channel,
            "📅 Tanggal Rilis": video.date,
            "⏳ Durasi": video.duration,
            "📥 Kualitas": video.quality,
            "💾 Ukuran": `${(video.contentLength / 1024 / 1024).toFixed(2)} MB`,
        };

        let infoMessage = `╭──[🎵 *YouTube - Video Downloader* ]\n` +
            `${Object.entries(metadata).map(([a, b]) => `᎒⊸ *${a}* : ${b}`).join("\n")}\n` +
            `╰────────────•`;

        if (!isAudio && !isVideo) {
            return sock.sendMessage(m.cht, {
                image: {
                    url: video.thumb
                },
                caption: infoMessage,
                footer: config.name,
                buttons: [{
                        buttonId: `.yt ${sock.yt[m.sender].url} --audio`,
                        buttonText: {
                            displayText: "🎵 Download Audio"
                        },
                        type: 1
                    },
                    {
                        buttonId: `.yt ${sock.yt[m.sender].url} --video`,
                        buttonText: {
                            displayText: "📹 Download Video"
                        },
                        type: 1
                    },
                ],
                headerType: 4,
                viewOnce: true,
            }, {
                quoted: m
            });
        }

        let finalUrl = sock.yt[m.sender]?.url || videoUrl;

        if (isAudio) {
            let audio = await ytmp3(finalUrl);
            if (audio.size > 10 * 1024 * 1024) {
                return sock.sendMessage(m.cht, {
                    document: audio.buffer,
                    mimetype: "audio/mpeg",
                    fileName: `${audio.meta.title}.mp3`,
                }, {
                    quoted: m
                });
            } else {
                return sock.sendMessage(m.cht, {
                    audio: audio.buffer,
                    mimetype: "audio/mpeg",
                    contextInfo: {
                        externalAdReply: {
                            mediaUrl: finalUrl,
                            mediaType: 2,
                            title: audio.meta.title,
                            body: "YouTube Audio",
                            thumbnailUrl: audio.meta.image,
                            sourceUrl: finalUrl,
                            renderLargerThumbnail: true,
                        },
                    },
                }, {
                    quoted: m
                });
            }
        } else if (isVideo) {
            if (video.contentLength > 10 * 1024 * 1024) {
                return sock.sendMessage(m.cht, {
                    document: {
                        url: video.videoUrl
                    },
                    mimetype: "video/mp4",
                    fileName: `${video.title}.mp4`,
                }, {
                    quoted: m
                });
            } else {
                return sock.sendMessage(m.cht, {
                    video: {
                        url: video.videoUrl
                    },
                    mimetype: "video/mp4",
                    contextInfo: {
                        externalAdReply: {
                            mediaUrl: video.videoUrl,
                            mediaType: 2,
                            title: video.title,
                            body: "YouTube Video",
                            thumbnailUrl: video.thumb,
                            sourceUrl: video.videoUrl,
                            renderLargerThumbnail: true,
                        },
                    },
                }, {
                    quoted: m
                });
            }
        }

        setTimeout(() => delete sock.yt[m.sender], 5000);
    },
};