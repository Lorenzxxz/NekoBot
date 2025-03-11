module.exports = {
  command: "taxy",
  alias: ["taksi"],
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
    
    if (now - rpg.lastTaxy < cooldown) {
      let timeLeft = Math.ceil((cooldown - (now - rpg.lastTaxy)) / 1000);
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      return m.reply(`⏳ Tunggu ${minutes} menit ${seconds} detik sebelum bisa bekerja sebagai taksi lagi.`);
    }

    let prosesTaksi = [
      "🚗 Sedang Mencari Penumpang...",
      "🚗 Menemukan Penumpang 👨...",
      "🚗 Berangkat Ke Tujuan...",
      "👨 Penumpang membayar gaji 💸..."
    ];

    for (let txt of prosesTaksi) {
      await m.reply(txt);
      await sleep(7000);
    }

    let dapatMoney = Math.floor(Math.random() * 400000) + 100000;
    let dapatExp = Math.floor(Math.random() * 50000) + 1;

    rpg.money += dapatMoney;
    rpg.exp += dapatExp;
    rpg.lastTaxy = now;

    let hasilNyaTxt = `
💼 *Perjalanan Selesai!*
━━━━━━━━━━━━━━━━━
💵 *Gaji Diterima:* +${dapatMoney.toLocaleString()} uang  
🎯 *Pengalaman:* +${dapatExp.toLocaleString()} exp  
━━━━━━━━━━━━━━━━━
🚀 Teruslah bekerja keras dan kumpulkan lebih banyak gaji!
`.trim();

    return m.reply({
      image: { url: "https://files.catbox.moe/rz9br7.jpg" },
      caption: hasilNyaTxt
    });
  },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}