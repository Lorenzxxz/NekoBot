const bail = require("baileys");
const { generateWAMessageFromContent, proto, toNumber } = bail;

module.exports = {
  command: "add",
  alias: [],
  category: ["group"],
  settings: {
    group: true,
    admin: true,
    botAdmin: true,
  },
  description: "Menambahkan anggota ke grup",
  async run(m, { sock, text, Func }) {
    const input = text ? text : m.quoted ? m.quoted.sender : m.mentions[0]
    if (!input) {
      throw "❗ *Format Salah*\nKirim perintah ini dengan format:\n> Ketik nomor pengguna yang ingin ditambahkan\n> Atau reply pesan pengguna dengan perintah ini.";
    }

    const p = await sock.onWhatsApp(input.trim());
    console.log(p);
    if (!p[0].exists) throw "⚠️ Pengguna tidak terdaftar di WhatsApp"
    const jid = p[0].jid
    const member = m.metadata.participants.find((u) => u.id === jid);
    if (member) {
      return m.reply("⚠️ Pengguna tersebut sudah menjadi anggota grup ini.");
    }

    const resp = await sock.groupParticipantsUpdate(m.cht, [jid], "add");
    for (let res of resp) {
      if (res.status === 421) {
        m.reply(
          "⚠️ Tidak dapat menambahkan pengguna tersebut. Mereka telah membatasi undangan ke grup.",
        );
      } else if (res.status === 408) {
        await m.reply(
          `✅ Undangan grup berhasil dikirim ke @${parseInt(res.jid)} karena pengguna baru saja keluar dari grup.`,
        );
        await sock.sendMessage(res.jid, {
          text:
            "✨ Anda diundang kembali ke grup ini: https://chat.whatsapp.com/" +
            (await sock.groupInviteCode(m.cht)),
        });
      } else if (res.status === 403) {
        await m.reply(
          `✅ Undangan grup berhasil dikirim ke @${parseInt(res.jid)}.`,
        );
        const { code, expiration } = res.content.content[0].attrs;
        const pp = await sock.profilePictureUrl(m.cht).catch(() => null);
        const gp = await Func.fetchBuffer(pp);

        const msgs = generateWAMessageFromContent(
          res.jid,
          proto.Message.fromObject({
            groupInviteMessage: {
              groupJid: m.cht,
              inviteCode: code,
              inviteExpiration: toNumber(expiration),
              groupName: m.metadata.subject,
              jpegThumbnail: gp || null,
              caption: `🌟 Hai @${res.jid.split("@")[0]}!\nAnda telah diundang oleh salah satu admin grup *${m.metadata.subject}*. Klik tombol di bawah untuk bergabung kembali!`,
            },
          }),
          { userJid: sock.user.jid },
        );

        await sock.copyNForward(jid, msgs);
      }
    }
  },
};
