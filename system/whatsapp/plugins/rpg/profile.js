module.exports = {
  command: "profile",
  alias: ["me"],
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

    if (!usr.premium) usr.premium = { status: false, expired: 0 };
    if (!usr.banned) usr.banned = { status: false, expired: 0 };

    let rpg = usr.rpg;

    const formatNumber = (num) =>
      num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const getTimeLeft = (expired) => {
      const now = Date.now();
      const timeLeft = expired - now;
      if (timeLeft <= 0) return "Expired";
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      return `${days}d ${hours}h`;
    };

    let profile = `╭━━━「 *PROFILE* 」━━━⊷\n`;
    profile += `┃ ⬡ *Name:* ${usr.name}\n`;
    profile += `┃ ⬡ *Level:* ${usr.level} ✨\n`;
    profile += `┃ ⬡ *Status:* ${usr.premium.status ? "Premium 👑" : "Free User 👤"}\n`;
    profile += `┃ ⬡ *Banned:* ${usr.banned.status ? "Yes ⛔" : "No ✅"}\n`;
    profile += `┃ ⬡ *Limit:* ${formatNumber(usr.limit)} 🎯\n`;
    profile += `┃ ⬡ *Registered:* ${usr.register ? "Yes ✅" : "No ❌"}\n`;
    profile += `╰━━━━━━━━━━━━━━━⊷\n\n`;

    profile += `╭━━━「 *BALANCE* 」━━━⊷\n`;
    profile += `┃ ⬡ *Money:* $${formatNumber(rpg.money)} 💵\n`;
    profile += `┃ ⬡ *Bank:* $${formatNumber(usr.bank)} 🏦\n`;
    profile += `┃ ⬡ *Coin:* ${formatNumber(usr.coin)} 🪙\n`;
    profile += `┃ ⬡ *XP:* ${formatNumber(rpg.exp)} ✨\n`;
    profile += `╰━━━━━━━━━━━━━━━⊷\n\n`;

    profile += `╭━━━「 *INVENTORY* 」━━━⊷\n`;
    profile += `┃ ⬡ *Sampah:* ${formatNumber(rpg.sampah)} 🗑️\n`;
    profile += `┃ ⬡ *Botol:* ${formatNumber(rpg.botol)} 🧊\n`;
    profile += `┃ ⬡ *Kardus:* ${formatNumber(rpg.kardus)} 📦\n`;
    profile += `┃ ⬡ *Iron:* ${formatNumber(rpg.iron)} ⚔️\n`;
    profile += `┃ ⬡ *Kayu:* ${formatNumber(rpg.kayu)} 🪵\n`;
    profile += `┃ ⬡ *Kaleng:* ${formatNumber(rpg.kaleng)} 🥫\n`;
    profile += `┃ ⬡ *Gelas:* ${formatNumber(rpg.gelas)} 🥛\n`;
    profile += `┃ ⬡ *Plastik:* ${formatNumber(rpg.plastik)} ♻️\n`;
    profile += `╰━━━━━━━━━━━━━━━⊷\n\n`;

    const now = Date.now();
    const formatCooldown = (time) => {
      if (time <= 0) return "Ready!";
      let minutes = Math.floor(time / 60000);
      let seconds = Math.floor((time % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    };

    const gajianCD = formatCooldown(rpg.lastGajian + 3600000 - now);
    const mulungCD = formatCooldown(rpg.lastMulung + 3600000 - now);
    const taxyCD = formatCooldown(rpg.lastTaxy + 3600000 - now);
    const gojekCD = formatCooldown(rpg.lastGojek + 3600000 - now);
    const merampokCD = formatCooldown(rpg.lastRob + 3600000 - now)

    profile += `╭━━━「 *COOLDOWNS* 」━━━⊷\n`;
    profile += `┃ ⬡ *Gajian:* ${gajianCD} ⏰\n`;
    profile += `┃ ⬡ *Mulung:* ${mulungCD} ⏰\n`;
    profile += `┃ ⬡ *Taxy:* ${taxyCD} ⏰\n`;
    profile += `┃ ⬡ *Gojek:* ${gojekCD} ⏰\n`;
    profile += `┃ ⬡ *Merampok:* ${merampokCD} ⏰\n`;    
    profile += `╰━━━━━━━━━━━━━━━⊷\n\n`;

    if (usr.premium.status) {
      profile += `╭━━━「 *PREMIUM* 」━━━⊷\n`;
      profile += `┃ ⬡ *Expired:* ${getTimeLeft(usr.premium.expired)} ⌛\n`;
      profile += `╰━━━━━━━━━━━━━━━⊷`;
    }

    let urlPic;
    try {
      urlPic = await sock.profilePictureUrl(m.sender, "image");
    } catch (error) {
      urlPic =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
    }

    await m.reply({
      image: {
        url: urlPic,
      },
      caption: profile,
    });
  },
};