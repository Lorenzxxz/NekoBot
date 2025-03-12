const config = require("@configuration");
const Func = require("@library/function.js");
const serialize = require("@library/serialize.js");
const Uploader = require("@library/uploader.js");
const { pkg, WABinary } = require("baileys");
const moment = require("moment-timezone");
const cron = require("node-cron");
const chalk = require("chalk");
const pickRandom = require("@utils/pickRandom.js");
const emoticons = require("@utils/emoticons.js");

module.exports = async (m, sock, store) => {

  if (config.settings.reactSw) {
  if (m.key.remoteJid === "status@broadcast") {
    await sock.readMessages([m.key]);
    await sock.sendMessage(
      'status@broadcast',
      { react: { text: pickRandom(emoticons), key: m.key } },
      { statusJidList: [m.key.participant] }
            );
    console.log(
      chalk.green.bold("– 📸 Membaca & Memberikan React Status WhatsApp dari : " + m.pushName),
    );
    return;
  }
  }
  
  if (config.settings.dmOnly && m.cht.endsWith("g.us")) return;
  if (config.settings.groupOnly && !m.fromMe && !m.isOwner && !m.cht.endsWith("g.us")) {
            await m.reply(`We apologize, but the bot is currently only accessible within groups. If you wish to use the bot privately, please upgrade your status. If you are interested, please contact our owner below:\n\n${config.owner.map((a, i) => `*• Contact ${i + 1} :* wa.me/` + a).join("\n")}`);
            return;
        }
  if (config.settings.statusOnly && m.chat !== "status@broadcast") return;
  
  await db.main(m);
  if (m.isBot) return;
  if (db.list().settings.self && !m.isOwner) return;
  if (m.isGroup && db.list().group[m.chat]?.mute && !m.isOwner) return;

  if (Object.keys(store.groupMetadata).length === 0) {
    store.groupMetadata = await sock.groupFetchAllParticipating();
  }

  const isPrems = db.list().user[m.sender].premium.status || false;
  const isBanned = db.list().user[m.sender].banned.status || false;
  const isAdmin = m.isAdmin;
  const botAdmin = m.isBotAdmin;
  const Scraper = await scraper.list();
  const usedPrefix = config.prefix.includes(m.prefix);
  const text = m.text;
  const isCmd = m.prefix && usedPrefix;
  const args = text.trim().split(/\s+/).slice(1);

  if (isCmd) {
    require("./whatsapp.js")(
      m,
      sock,
      config,
      text,
      args,
      Func,
      Scraper,
      Uploader,
      store,
      isAdmin,
      botAdmin,
      isPrems,
      isBanned
    );
  };
  
  cron.schedule("* * * * *", () => {
    let user = Object.keys(db.list().user);
    let time = moment.tz(config.tz).format("HH:mm");
    if (db.list().settings.resetlimit == time) {
      for (let i of user) {
        db.list().user[i].limit = 100;
      }
    }
  });

  for (let name in pg.plugins) {
    let plugin;
    if (typeof pg.plugins[name].run === "function") {
      let anu = pg.plugins[name];
      plugin = anu.run;
      for (let prop in anu) {
        if (prop !== "code") {
          plugin[prop] = anu[prop];
        }
      }
    } else {
      plugin = pg.plugins[name];
    }
    if (!plugin) return;

    try {
      if (typeof plugin.events === "function") {
        if (
          plugin.events.call(sock, m, {
            sock,
            Func,
            config,
            Uploader,
            store,
            isAdmin,
            botAdmin,
            isPrems,
            isBanned,
          })
        )
          continue;
      }

      const cmd = usedPrefix
        ? m.command.toLowerCase() === plugin.command ||
          plugin?.alias?.includes(m.command.toLowerCase())
        : "";
      if (cmd) {
        if (plugin.loading) {
           m.react("🕐");
           m.reply(config.messages.wait)
        }      
      if (plugin.presence) {
            const presenceOptions = [
              "unavailable",
              "available",
              "composing",
              "recording",
              "paused",
            ];
            await sock.sendPresenceUpdate(
              presenceOptions.includes(plugin.presence)
                ? plugin.presence
                : "composing",
              m.id
            );
        }
      if (plugin.react) {
          m.react(plugin.react);
        } // ini custom react, selain loading, jadi bukan hanya react "🕐"
      if (plugin.settings) {
        if (plugin.settings.owner && !m.isOwner) {
      return m.reply(config.messages.owner);
        }
      if (plugin.example && command && !text) {
        let txt = plugins.example.replace("%cmd", prefix + command);
      return m.reply(`${config.messages.example} : ${txt}`);                        
        }
      if (plugin.settings.group && !m.isGroup) {
      return m.reply(config.messages.group);
        }
      if (plugin.settings.admin && !m.isAdmin) {
      return m.reply(config.messages.admin);
        }
      if (plugin.settings.botAdmin && !m.isBotAdmin) {
      return m.reply(config.messages.botAdmin);
        }
      if (plugin.settings.premium) {
      return m.reply(config.messages.premium);
        }
      if (plugin.settings.register && !db.list().user[m.sender]?.register) {
      return m.reply(config.messages.unregistered);
  }
}

        await plugin(m, {
          sock,
          config,
          text,
          args,
          plugins: Object.values(pg.plugins).filter((a) => a.alias),
          Func,
          Scraper,
          Uploader,
          store,
          isAdmin,
          botAdmin,
          isPrems,
          isBanned,
        })
          .then(async (a) => {
            if (plugin?.settings?.limit && !isPrems && !m.isOwner) {
              db.list().user[m.sender].limit -= 1;
              m.reply(
                `> 💡 *Informasi:* Kamu telah menggunakan fitur limit\n> *- Limit kamu saat ini:* ${db.list().user[m.sender].limit} tersisa ☘️\n> *- Catatan:* Limit akan direset pada pukul 02:00 WIB setiap harinya.`,
              );
            }
          });
      }

    } catch (error) {
      if (error.name) {
        for (let owner of config.owner) {
          let jid = await sock.onWhatsApp(owner + "@s.whatsapp.net");
          if (!jid[0].exists) continue;
          let caption = "*– 乂 *Error Terdeteksi* 📉*\n"
          caption += `> *Nama command:* ${m.command}\n`
          caption += `> *Lokasi File:* ${name}`
          caption += `\n\n${Func.jsonFormat(error)}`

          sock.sendMessage(owner + "@s.whatsapp.net", {
            text: caption
          })
        }
        m.reply(Func.jsonFormat(error));
      } else {
        m.reply(Func.jsonFormat(error));
      }
    } finally {
      if (db.list().settings.online) {
        await sock.readMessages([m.key]);
      }
    }
  }
};
