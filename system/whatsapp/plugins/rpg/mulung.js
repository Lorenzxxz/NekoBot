module.exports = {
  command: "mulung",
  alias: ["mungut"],
  category: ["rpg"],
  settings: {},
  async run(m, { sock, config }) {
    let dbUser = db.list().user[m.sender];

    if (!dbUser || !dbUser.register) {
      return m.reply(config.messages.unregistered);
    }

    if (!dbUser.rpg) {
      dbUser.rpg = {
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

    let user = dbUser.rpg;

    let cooldown = 30 * 60 * 1000;
    if (user.lastMulung && Date.now() - user.lastMulung < cooldown) {
      let remaining = cooldown - (Date.now() - user.lastMulung);
      let minutes = Math.floor(remaining / (60 * 1000));
      let seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return m.reply(`⏳ Mohon tunggu *${minutes} menit ${seconds} detik* sebelum mulung kembali!`);
    }

    let items = {
      kaleng: ["🥫", Math.floor(Math.random() * 450) + 50],
      kardus: ["📦", Math.floor(Math.random() * 450) + 50],
      plastik: ["💳", Math.floor(Math.random() * 450) + 50],
      botol: ["🍾", Math.floor(Math.random() * 450) + 50],
      sampah: ["🗑️", Math.floor(Math.random() * 450) + 50],
      kayu: ["🪵", Math.floor(Math.random() * 450) + 50],
      iron: ["⛓️", Math.floor(Math.random() * 450) + 50],
      gelas: ["🥤", Math.floor(Math.random() * 450) + 50],
    };

    let resultText = `*🔍 Hasil Mulung:*\n`;
    for (let [item, [emote, amount]] of Object.entries(items)) {
      user[item] = (user[item] || 0) + amount;
      resultText += `${emote} ${item}: +${amount}\n`;
    }

    user.lastMulung = Date.now();

    return m.reply(`${resultText}\n\n> *Tunggu 30 Menit Untuk Memulung Lagi*`);
  },
};