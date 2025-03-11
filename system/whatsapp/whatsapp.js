//============================
// - buat Pengguna case bisa tambah fitur disini
// - Fitur akan otomatis terlihat di .menu jadi jangan bikin fitur menu lagi 👍
//============================

const util = require("util");
const {
    exec
} = require("child_process");
const fs = require("node:fs");
const axios = require("axios");
const cheerio = require("cheerio");
const Func = require("@library/function");
const {
    writeExif
} = require("@library/sticker");
const pkg = require("@library/case");
const Case = new pkg("./system/whatsapp/whatsapp.js");

module.exports = async (m,
    sock,
    config,
    text,
    Func,
    Scraper,
    Uploader,
    store,
    isAdmin,
    botAdmin,
    isPrems,
    isBanned,
) => {    
    const quoted = m.isQuoted ? m.quoted : m;
    switch (m.command) {
        case "brat": {
            const {
                execSync
            } = require("child_process");
            const fs = require("fs");
            const path = require("path");

            let input = m.isQuoted ? m.quoted.body : text;
            if (!input) return m.reply("> Reply/Masukan pesan");
            m.reply(config.messages.wait);

            if (m.text.includes("--animated")) {
                let txt = input.replace("--animated", "").trim().split(" ");
                let array = [];
                let tmpDirBase = path.resolve(`./tmp/brat_${Date.now()}`);

                fs.mkdirSync(tmpDirBase, {
                    recursive: true
                })
                for (let i = 0; i < txt.length; i++) {
                    let word = txt.slice(0, i + 1).join(" ");
                    let media = (await axios.get(`https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(word)}`, {
                        responseType: 'arraybuffer'
                    })).data;
                    let tmpDir = path.resolve(`${tmpDirBase}/brat_${i}.mp4`);
                    fs.writeFileSync(tmpDir, media);
                    array.push(tmpDir);
                }

                let fileTxt = path.resolve(`${tmpDirBase}/cmd.txt`);
                let content = "";
                for (let i = 0; i < array.length; i++) {
                    content += `file '${array[i]}'\n`;
                    content += `duration 0.5\n`;
                }
                content += `file '${array[array.length - 1]}'\n`;
                content += `duration 3\n`;
                fs.writeFileSync(fileTxt, content);

                let output = path.resolve(`${tmpDirBase}/output.mp4`);
                execSync(`ffmpeg -y -f concat -safe 0 -i ${fileTxt} -vf "fps=30" -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 00:00:10 ${output}`);
                let sticker = await writeExif({
                    mimetype: "video",
                    data: fs.readFileSync(output)
                }, {
                    packName: config.sticker.packname,
                    packPublish: config.sticker.author
                });
                fs.rmSync(tmpDirBase, {
                    recursive: true,
                    force: true
                });
                await m.reply({
                    sticker
                });
            } else {
                let media = (await axios.get(`https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(input)}`, {
                    responseType: 'arraybuffer'
                })).data;
                let sticker = await writeExif({
                    mimetype: "image",
                    data: media
                }, {
                    packName: config.sticker.packname,
                    packPublish: config.sticker.author
                });
                await m.reply({
                    sticker
                });
            }
        }
        break;
        case "daftar": {
            let user = db.list().user[m.sender];
            if (user.register) return m.reply("> 🎉 Kamu sudah terdaftar!");
            if (!text) return m.reply("> 📢 Masukkan nama kamu untuk pendaftaran!");

            let list = Object.values(db.list().user).find((a) => a.name.toLowerCase() === text.toLowerCase());
            if (list) return m.reply("> ❗ Nama tersebut sudah digunakan!");

            let bonus = 100000;
            user.register = true;
            user.name = text;
            user.rpg.money += bonus;
            user.rpg.exp += 10000;

            let cap = `*– 乂 Pendaftaran Berhasil!*\n`;
            cap += `> 🎉 Selamat ${user.name}, kamu berhasil mendaftar dan mendapatkan bonus tambahan!\n\n`;

            cap += `*– 乂 Hadiah Pendaftaran*\n`;
            cap += `> 💰 *Money:* 100.000\n`;
            cap += `> 📊 *Exp:* 10.000\n`;

            m.reply(cap);
        }
        break;

        case "jadwalsholat": {
            const axios = require('axios');
            const cheerio = require('cheerio');
            if (!text) return m.reply("> 📍 Masukkan nama kota yang kamu tuju!");
            const kota = text?.toLowerCase() || 'jakarta';

            try {
                const {
                    data
                } = await axios.get(`https://jadwal-sholat.tirto.id/kota-${kota}`);
                const $ = cheerio.load(data);

                const jadwal = $('tr.currDate td').map((i, el) => $(el).text()).get();

                if (jadwal.length === 7) {
                    const [tanggal, subuh, duha, dzuhur, ashar, maghrib, isya] = jadwal;

                    const zan = `
╭──[ *📅 Jadwal Sholat* ]──✧
᎒⊸ *🌆 Kota*: ${kota.charAt(0).toUpperCase() + kota.slice(1)}
᎒⊸ *📅 Tanggal*: ${tanggal}

╭──[ *🕰️ Waktu Sholat* ]──✧
᎒⊸ *Subuh:* ${subuh}
᎒⊸ *Duha:* ${duha}
᎒⊸ *Dzuhur:* ${dzuhur}
᎒⊸ *Ashar:* ${ashar}
᎒⊸ *Maghrib:* ${maghrib}
᎒⊸ *Isya:* ${isya}
╰────────────•`;

                    await m.reply(zan);
                } else {
                    await m.reply('❌ Jadwal sholat tidak ditemukan. Pastikan nama kota sesuai.');
                }
            } catch (error) {
                await m.reply('❌ Terjadi kesalahan saat mengambil data!');
            }
        }
        break;
       
        case "sticker":
        case "s": {
            if (/image|video|webp/.test(quoted.msg.mimetype)) {
                let media = await quoted.download();
                if (quoted.msg?.seconds > 10)
                    throw "> *⚠️ Video lebih dari 10 detik tidak dapat dijadikan sticker*.";

                let exif;
                if (text) {
                    let [packname, author] = text.split(/[,|\-+&]/);
                    exif = {
                        packName: packname ? packname : "",
                        packPublish: author ? author : "",
                    };
                } else {
                    exif = {
                        packName: config.sticker.packname,
                        packPublish: config.sticker.author,
                    };
                }

                let sticker = await writeExif({
                    mimetype: quoted.msg.mimetype,
                    data: media
                }, exif);

                await m.reply({
                    sticker
                });
            } else if (m.mentions.length !== 0) {
                for (let id of m.mentions) {
                    await delay(1500);
                    let url = await sock.profilePictureUrl(id, "image");
                    let media = await axios
                        .get(url, {
                            responseType: "arraybuffer",
                        })
                        .then((a) => a.data);
                    let sticker = await writeExif(media, {
                        packName: config.sticker.packname,
                        packPublish: config.sticker.author,
                    });
                    await m.reply({
                        sticker
                    });
                }
            } else if (
                /(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(
                    text,
                )
            ) {
                for (let url of Func.isUrl(text)) {
                    await delay(1500);
                }
            } else {
                m.reply("> *📸 Balas dengan foto atau video untuk dijadikan sticker*.");
            }
        }
        break;        
        
        case 'hentai': {
    function hentai() {
        return new Promise((resolve, reject) => {
            const page = Math.floor(Math.random() * 1153);
            axios.get('https://sfmcompile.club/page/' + page)
                .then((data) => {
                    const $ = cheerio.load(data.data);
                    const hasil = [];
                    $('#primary > div > div > ul > li > article').each(function (a, b) {
                        hasil.push({
                            title: $(b).find('header > h2').text(),
                            link: $(b).find('header > h2 > a').attr('href'),
                            category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                            share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                            views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                            type: $(b).find('source').attr('type') || 'image/jpeg',
                            video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                            video_2: $(b).find('video > a').attr('href') || ''
                        });
                    });
                    resolve(hasil);
                })
                .catch(reject);
        });
    }
    anu = await hentai();
    result912 = anu[Math.floor(Math.random() * anu.length)];
    let messageText = `*Title* : ${result912.title}\n` +
                      `*Category* : ${result912.category}\n` +
                      `*Mimetype* : ${result912.type}\n` +
                      `*Views* : ${result912.views_count}\n` +
                      `*Shares* : ${result912.share_count}\n` +
                      `*Source* : ${result912.link}`;
    let buffer = result912.video_1;
    await m.reply({
        video: {
            url: buffer,
        },
        caption: messageText,
    });
}
        break;
        
case 'hentaisearch': {
    function hentaisearch(query) {
        return new Promise((resolve, reject) => {
            axios.get(`https://sfmcompile.club/?s=${encodeURIComponent(query)}`)
                .then((data) => {
                    const $ = cheerio.load(data.data);
                    const hasil = [];

                    $('#primary > div > div > ul > li > article').each((_, b) => {
                        hasil.push({
                            title: $(b).find('header > h2').text().trim() || 'No title',
                            link: $(b).find('header > h2 > a').attr('href') || '',
                            category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', '').trim() || 'Unknown',
                            share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text().trim() || '0',
                            views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text().trim() || '0',
                            type: $(b).find('source').attr('type') || 'image/jpeg',
                            video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src') || '',
                            video_2: $(b).find('video > a').attr('href') || ''
                        });
                    });

                    resolve(hasil);
                })
                .catch(err => reject(err));
        });
    }

    const text = m.text.split(' ').slice(1).join(' ').trim();
    if (!text) {
        return m.reply("> *🔍 Masukkan judul/nama video yang ingin dicari*");
    }

    const anu = await hentaisearch(text);
    if (!anu.length) {
        return m.reply("> ❌ *Tidak ditemukan hasil untuk pencarian tersebut*");
    }

    const result = anu[Math.floor(Math.random() * anu.length)];
    const messageText = `*Title:* ${result.title}\n` +
                        `*Category:* ${result.category}\n` +
                        `*Mimetype:* ${result.type}\n` +
                        `*Views:* ${result.views_count}\n` +
                        `*Shares:* ${result.share_count}\n` +
                        `*Source:* ${result.link}`;

    await m.reply(result.type.includes('video') ? {
        video: { url: result.video_1 },
        caption: messageText
    } : {
        image: { url: result.video_1 },
        caption: messageText
    });

    break;
}
        
        case 'husbando': {
  try {
    let response = await (await fetch('https://nekos.best/api/v2/husbando')).json();
    let husbandoData = response.results[0];
    await m.reply({
      image: {
        url: husbandoData.url,
      },
      caption: config.messages.success,
    });
  } catch (error) {
    m.reply('error');
  }
}
        break;
        
        case 'cosplay': {
  try {    
    await m.reply({
      image: {
        url: "https://fantox-cosplay-api.onrender.com",
      },
      caption: config.messages.success,
    });
  } catch (error) {
    m.reply('error');
  }
}
        break;

        case 'kitsune': {
  try {
    let response = await (await fetch('https://nekos.best/api/v2/kitsune')).json();
    let kitsuneData = response.results[0];
    await m.reply({
      image: {
        url: kitsuneData.url,
      },
      caption: config.messages.success,
    });
  } catch (error) {
    m.reply('error');
  }
}
         break;

         case 'waifu': {
  try {
    let response = await (await fetch('https://nekos.best/api/v2/waifu')).json();
    let waifuData = response.results[0];
    await m.reply({
      image: {
        url: waifuData.url,
      },
      caption: config.messages.success,
    });
  } catch (error) {
    m.reply('error');
  }
}
        break;
        
        case 'sendtotg': {
      try {
        await axios.post(`https://api.telegram.org/bot${config.telegram.token}/sendMessage`, {
            chat_id: `${config.telegram.ownerID}`,
            text: `${message}\n\nPesan ini dikirim melalui WhatsApp`
        });
    } catch (error) {
    }
}
        break;
        
        case "cases": {
            if (!m.isOwner) return m.reply(config.messages.owner);

            let cap = "*– 乂 Cara Penggunaan Fitur Case*\n";
            cap += "> *➕ `--add`* untuk menambah fitur case baru\n";
            cap += "> *🔄 `--get`* untuk mengambil fitur case yang ada\n";
            cap += "> *❌ `--delete`* untuk menghapus fitur case\n";
            cap += "\n*– 乂 Daftar Case yang Tersedia :*\n";
            cap += Case.list().map((a, i) => `> *${i + 1}.* ${a}`).join("\n");

            if (!text) return m.reply(cap);

            if (text.includes("--add")) {
                if (!m.quoted) return m.reply("> *⚠️ Balas dengan fitur case yang ingin disimpan*.");
                let status = Case.add(m.quoted.body);
                m.reply(status ? "> *✅ Berhasil menambahkan case baru!*" : "> *❌ Gagal menambahkan case baru*.");
            } else if (text.includes("--delete")) {
                let input = text.replace("--delete", "").trim();
                if (!input) return m.reply("> *⚠️ Masukkan nama case yang ingin dihapus*!");
                let status = Case.delete(input);
                m.reply(status ? `> *✅ Berhasil menghapus case: ${input}!*` : `> *❌ Case ${input} tidak ditemukan. Periksa daftar case yang tersedia*.`);
            } else if (text.includes("--get")) {
                let input = text.replace("--get", "").trim();
                if (!input) return m.reply("> *⚠️ Masukkan nama case yang ingin diambil*!");
                if (!Case.list().includes(input)) return m.reply("> *❌ Case tidak ditemukan!*");
                let status = Case.get(input);
                m.reply(status ? status : `> *❌ Case ${input} tidak ditemukan. Periksa daftar case yang tersedia*.`);
            }
        }
        break;
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log("- Terjadi perubahan pada files case/case.js");
    delete require.cache[file];
});