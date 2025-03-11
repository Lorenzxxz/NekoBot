module.exports = {
  command: "rob",
  alias: ["rampok", "merampok"],
  category: ["rpg"],
  settings: {},
  async run(m, { sock, config }) {
    let usr = db.list().user[m.sender];

    if (!usr || !usr.register) {
      return m.reply(config.messages.unregistered);
    }

    if (!usr.rpg) {
      usr.rpg = {
        money: 0,
        exp: 0,
        lastGajian: 0,
        sampah: 0,
        botol: 0,
        kardus: 0,
        iron: 0,
        kayu: 0,
        kaleng: 0,
        gelas: 0,
        plastik: 0,
        lastMulung: 0,
        lastTaxy: 0,
        lastGojek: 0,
        lastRob: 0,
      };
    }

    let rpg = usr.rpg;

    let cooldown = 3 * 60 * 60 * 1000;
    let now = Date.now();

    let chance = Math.random() * 100;
    let successRate = 50;

    if (chance <= successRate) {
      if (now - rpg.lastRob < cooldown) {
        let timeLeft = Math.ceil((cooldown - (now - rpg.lastRob)) / 1000);
        let hours = Math.floor(timeLeft / 3600);
        let minutes = Math.floor((timeLeft % 3600) / 60);
        let seconds = timeLeft % 60;
        return m.reply(`⏳ Tunggu ${hours} jam ${minutes} menit ${seconds} detik sebelum bisa merampok bank lagi.`);
      }

      let prosesRob = [
        "🔪 Menyiapkan Rencana Perampokan...",
        "💣 Menjinakkan Alarm dan Membuka Brankas...",
        "🚔 Polisi Sedang Berpatroli, Harus Cepat!",
        "💰 Mengambil Uang dan Kabur dari Bank...",
        "🏃‍♂️ Berhasil Melarikan Diri dengan Uang!"
      ];

      for (let txt of prosesRob) {
        await m.reply(txt);
        await sleep(7000);
      }

      let dapatMoney = Math.floor(Math.random() * 4000000) + 1000000;
      let dapatExp = Math.floor(Math.random() * 70000) + 20000;

      rpg.money += dapatMoney;
      rpg.exp += dapatExp;
      rpg.lastRob = now;

      let hasilNyaTxt = `
💰 *Perampokan Berhasil!*
━━━━━━━━━━━━━━━━━
💵 *Uang Didapat:* +${dapatMoney.toLocaleString()} uang  
🎯 *Pengalaman:* +${dapatExp.toLocaleString()} exp  
━━━━━━━━━━━━━━━━━
⚠️ Waspadalah! Polisi bisa mengincarmu di lain waktu.
`.trim();

      return m.reply({
        image: { url: "https://files.catbox.moe/36sixy.jpg" },
        caption: hasilNyaTxt
      });

    } else {
      let gagalText = `
🚔 *PERAMPOKAN GAGAL!*
━━━━━━━━━━━━━━━━━
😔 Kamu gagal merampok bank dan harus kabur!
🏃‍♂️ Untungnya, kamu berhasil melarikan diri dan bisa mencoba lagi.
━━━━━━━━━━━━━━━━━
⚠️ Coba lagi segera sebelum polisi menemukanmu!
`.trim();

      return m.reply({
        image: { url: "https://telegra.ph/file/afcf9a7f4e713591080b5.jpg" },
        caption: gagalText
      });
    }
  },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}