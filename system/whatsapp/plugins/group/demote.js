module.exports = {
  command: "demote",
  alias: ["jadimember"],
  category: ["group"],
  settings: {
    group: true,
    admin: true,
    botAdmin: true,
  },
  description: "🔻 Menurunkan admin menjadi anggota biasa di grup",
  async run(m, { sock, text }) {
    let who = m.quoted
      ? m.quoted.sender
      : m.mentions.length > 0
        ? m.mentions[0]
        : false;

    if (!who) {
      throw `*⚠️ Perintah Tidak Lengkap!*\n\n> *Gunakan salah satu cara berikut:*\n  • Tag member dengan: @username\n  • Balas pesan member yang ingin diturunkan.\n\n📌 _Pastikan kamu memiliki hak sebagai admin grup._`;
    }

    let user = await sock.onWhatsApp(who);
    if (!user[0].exists) {
      throw `*❌ Member Tidak Ditemukan!*\n\n> Akun WhatsApp ini tidak terdaftar atau sudah tidak aktif.`;
    }

    await sock
      .groupParticipantsUpdate(m.cht, [who], "demote")
      .then(() => {
        m.reply(
          `*✅ Berhasil!* 🎉\n\n> Jabatan @${who.split("@")[0]} telah diturunkan menjadi anggota biasa.\n\n📌 _Gunakan perintah ini dengan bijak untuk menjaga keharmonisan grup._`,
        );
      })
      .catch((err) => {
        m.reply(
          `*❌ Gagal!*\n\n> Tidak dapat menurunkan jabatan admin untuk @${who.split("@")[0]}.\n📌 _Pastikan bot memiliki hak admin untuk melakukan perubahan ini._`,
        );
      });
  },
};
