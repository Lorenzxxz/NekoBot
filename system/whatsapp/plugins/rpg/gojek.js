module.exports = {
  command: "gojek",
  alias: ["ojek"],
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

    let cooldown = 30 * 60 * 1000;
    let now = Date.now();
    
    if (now - rpg.lastGojek < cooldown) {
      let timeLeft = Math.ceil((cooldown - (now - rpg.lastGojek)) / 1000);
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      return m.reply(`⏳ Tunggu ${minutes} menit ${seconds} detik sebelum bisa bekerja sebagai driver Gojek lagi.`);
    }

    let prosesGojek = [
      "🛵 Mencari Orderan...",
      "🛵 Menemukan Penumpang 👨...",
      "🛵 Mengantar ke Tujuan...",
      "👨 Penumpang membayar ongkos 💸..."
    ];

    for (let txt of prosesGojek) {
      await m.reply(txt);
      await sleep(7000);
    }

    let dapatMoney = Math.floor(Math.random() * 300000) + 50000;
    let dapatExp = Math.floor(Math.random() * 40000) + 1;

    rpg.money += dapatMoney;
    rpg.exp += dapatExp;
    rpg.lastGojek = now;

    let hasilNyaTxt = `
🛵 *Perjalanan Selesai!*
━━━━━━━━━━━━━━━━━
💵 *Pendapatan:* +${dapatMoney.toLocaleString()} uang  
🎯 *Pengalaman:* +${dapatExp.toLocaleString()} exp  
━━━━━━━━━━━━━━━━━
🚀 Teruslah bekerja dan tingkatkan penghasilanmu!
`.trim();

    return m.reply({
      image: { url: "https://files.catbox.moe/nprwoe.jpg" },
      caption: hasilNyaTxt
    });
  },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}