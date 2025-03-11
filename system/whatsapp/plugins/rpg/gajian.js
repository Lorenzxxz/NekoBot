let money = 500000;
let exp = 50000;
let cooldown = 1 * 60 * 60 * 1000;

module.exports = {
  command: "gajian",
  alias: ["gaji"],
  category: ["rpg"],
  settings: {},
  async run(m, { sock, config }) {
    const user = db.list().user[m.sender];
    if (!user || !user.register) {
       return m.reply(config.messages.unregistered);
    }
    let now = Date.now();

    if (user.rpg.lastGajian && now - user.rpg.lastGajian < cooldown) {
      let remaining = cooldown - (now - user.rpg.lastGajian);
      let hours = Math.floor(remaining / (60 * 60 * 1000));
      let minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      let timeLeft = `${hours} jam ${minutes} menit`;

      return m.reply(
        `Mohon bersabar, gaji Anda masih dalam proses! ⏳\nSilakan tunggu ${timeLeft} lagi`,
      );
    }

    user.rpg.money += money;
    user.rpg.exp += exp;
    user.rpg.lastGajian = now;

    let nextClaim = new Date(now + cooldown).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let cap = `Anda mendapatkan gaji senilai\n> 💵 + 500000 Money\n> 🎁 + 50000 Exp\n\n> Tunggu 1 Jam Untuk Mulai Gajian Lagi`;
    
    return m.reply({
        image: {
          url: "https://files.catbox.moe/qg52ic.jpg",
        },
        caption: cap        
      });
  },
};
