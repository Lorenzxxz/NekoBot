const axios = require("axios");

class Tiktok {
    search = async (q) => {
        const maxRetries = 10;
        let attempt = 0;
        let response;
        while (attempt < maxRetries) {
            try {
                const data = {
                    count: 20,
                    cursor: 0,
                    web: 1,
                    hd: 1,
                    keywords: q,
                };
                const config = {
                    method: "post",
                    url: "https://tikwm.com/api/feed/search",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        Accept: "application/json, text/javascript, */*; q=0.01",
                        "X-Requested-With": "XMLHttpRequest",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
                        Referer: "https://tikwm.com/",
                    },
                    data: data,
                };
                response = await axios(config);
                console.log(JSON.stringify(response.data, null, 2));
                if (response.data.data) {
                    return response.data.data.videos.map((a) => ({
                        metadata: {
                            title: a.title,
                            duration: a.duration,
                            region: a.region,
                            video_id: a.video_id,
                            thumbnail: "https://tikwm.com" + a.cover,
                            create_at: new Date(a.create_time * 1000)
                                .toLocaleString("ID")
                                .toString(),
                        },
                        stats: {
                            play: Number(a.play_count).toLocaleString(),
                            like: Number(a.digg_count).toLocaleString(),
                            comment: Number(a.comment_count).toLocaleString(),
                            share: Number(a.share_count).toLocaleString(),
                            download: Number(a.download_count).toLocaleString(),
                        },
                        music: a.music_info,
                        author: {
                            name: a.author.nickname,
                            username: "@" + a.author.unique_id,
                            avatar: "https://tikwm.com" + a.author.avatar,
                        },
                        media: {
                            no_watermark: "https://tikwm.com" + a.play,
                            watermark: "https://tikwm.com" + a.wmplay,
                            audio: "https://tikwm.com" + a.music,
                        },
                    }));
                } else {
                    console.warn("Tidak ada data, mencoba lagi...");
                    attempt++;
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error("Terjadi kesalahan: ", error.message);
                attempt++;
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
        return "Kebanyakan spam ini kasih delay dong";
    };
    download = async (url) => {
        let retries = 0;
        let response;
        let maxRetries = 10;
        let retryDelay = 4000;
        while (retries < maxRetries) {
            try {
                response = await axios(`https://tikwm.com/api/?url=${url}`).catch(e => e.response);
                if (response && response.data && response.data.data) {
                    return response.data.data;
                } else if (response && response.data && response.data.msg) {
                    console.error(`Error from API: ${response.data.msg}`);
                    throw new Error(`API Error: ${response.data.msg}`);
                } else {
                    console.error("Unexpected response from API. Retrying...");
                    throw new Error("Unexpected API response");
                }
            } catch (error) {
                console.error(`Attempt ${retries + 1} failed: ${error.message}`);
                retries++;
                if (retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                    console.error(`Max retries reached. Giving up after ${maxRetries} attempts.`);
                    throw error;
                }
            }
        }
    };
    stalk = async function stalk(nickname) {
        return new Promise(async (resolve, reject) => {
            const headers = {
                Referer: "https://countik.com/user/@" + nickname,
                "User-Agent": require("fake-useragent")(),
            };
            await axios
                .get(`https://countik.com/api/exist/${nickname.toLowerCase()}`, {
                    headers,
                })
                .then(async (a) => {
                    let id = a.data.sec_uid;
                    if (!id)
                        reject({
                            msg: "ID tidak ditemukan !",
                        });
                    let {
                        data
                    } = await axios
                        .get(`https://countik.com/api/userinfo?sec_user_id=${id}`, {
                            headers,
                        })
                        .catch((e) => e.response);
                    if (!data.followerCount)
                        return reject({
                            msg: "Username Tiktok tidak ditemukan !",
                        });
                    resolve({
                        nickname: a.data.nickname,
                        avatar: data.avatarThumb,
                        country: data.country,
                        followers: data.followerCount.toLocaleString(),
                        following: data.followingCount.toLocaleString(),
                        bio: data.signature,
                        heart: data.heartCount.toLocaleString(),
                    });
                })
                .catch((e) =>
                    reject({
                        msg: "Gagal mendapatkan data  dari Web",
                        error: e.response.data,
                    }),
                );
        });
    };
}

module.exports = new Tiktok();