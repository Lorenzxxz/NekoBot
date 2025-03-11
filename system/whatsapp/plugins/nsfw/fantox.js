const fs = require("fs");
const axios = require("axios");
const jsBeautify = require("js-beautify");

const nsfwCategories = [
    "genshin", "swimsuit", "schoolswimsuit", "white", "barefoot", "tornclothes",
    "touhou", "gamecg", "uncensored", "glasses", "weapon", "shirtlift", "chain",
    "fingering", "flatchest", "bondage", "demon", "pantypull", "headdress",
    "headphones", "anusview", "shorts", "stockings", "topless", "beach",
    "bunnygirl", "bunnyears", "vampire", "nobra", "bikini", "whitehair",
    "blonde", "pinkhair", "bed", "ponytail", "nude", "dress", "underwear",
    "foxgirl", "skirt", "breasts", "twintails", "spreadpussy", "seethrough",
    "breasthold", "fateseries", "openshirt", "headband", "nipples",
    "erectnipples", "greenhair", "wolfgirl", "catgirl"
];

module.exports = {
    command: "nsfw",
    alias: ["fantox"],
    category: ["nsfw"],
    settings: {
        owner: false,
    },
    description: "Mendapatkan gambar NSFW dari berbagai kategori yang tersedia",
    async run(m, { text, sock, Func, config }) {
        if (!text) {
            return m.reply(`> *– 乂 Panduan Penggunaan Perintah* 💡\n> 1. Gunakan *\`.nsfw [kategori]\`* untuk mengambil gambar\n> 2. Gunakan *\`.nsfw --list\`* untuk melihat daftar kategori\n`);
        }

        if (text === "--list") {
            return m.reply(`> *– 乂 Kategori NSFW Tersedia:*\n${nsfwCategories.map((c, i) => `> *${i + 1}.* ${c}`).join("\n")}`);
        }        

        if (!nsfwCategories.includes(text)) {
            return m.reply(`> ❌ *Kategori tidak ditemukan!*\n> Gunakan \`.nsfw --list\` untuk melihat daftar kategori yang tersedia.`);
        }

        try {
            let res = await axios.get(`https://fantox-apis.vercel.app/${text}`);
            if (!res.data.url) throw "Error";
            await m.reply({
                image: { url: res.data.url },
                caption: config.messages.success
            });
        } catch (e) {
            return m.reply(`> ❌ *Gagal mengambil gambar untuk kategori "${text}"*\n> Coba lagi nanti atau pilih kategori lain.`);
        }
    }
};