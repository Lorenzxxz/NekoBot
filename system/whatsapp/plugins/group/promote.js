module.exports = {
  command: "promote",
  alias: ["jadiadmin", "newking"],
  category: ["group"],
  settings: {
    group: true,
    admin: true,
    botAdmin: true,
  },
  description: "👑 Menjadikan member sebagai admin grup",
  async run(m, { sock, text }) {
    let who = m.quoted
      ? m.quoted.sender
      : m.mentions.length > 0
        ? m.mentions[0]
        : false;

    if (!who)
      throw `*🚫 Perintah Gagal!*\n\n> Tag atau balas pesan member yang ingin dijadikan admin.`;

    let user = await sock.onWhatsApp(who);
    if (!user[0].exists)
      throw `*❌ Error!*\n\n> Nomor tersebut tidak terdaftar di WhatsApp.`;

    await sock
      .groupParticipantsUpdate(m.cht, [who], "promote")
      .then(() => {
        let name = who.split("@")[0];
        m.reply(
          `*✅ Promosi Berhasil!*\n\n> 🎉 Selamat kepada *@${name}* karena telah menjadi admin grup!\n\n📌 _Gunakan jabatan ini dengan bijak._`,
          { mentions: [who] },
        );
      })
      .catch(() => {
        m.reply(
          `*❌ Gagal Memproses!*\n\n> Pastikan bot memiliki hak admin untuk melakukan perubahan ini.`,
        );
      });
  },
};
