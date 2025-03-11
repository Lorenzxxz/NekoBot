module.exports = {
  command: "gcsetting",
  alias: ["groupsetting", "settingc"],
  category: ["group"],
  settings: {
    group: true,
    admin: true,
    botAdmin: true,
  },
  description: "🔒 Mengatur Akses Grup: Membuka/Tutup Grup",
  loading: true,
  async run(m, { sock, text }) {
    if (!text)
      throw `*– 乂 Cara Penggunaan:*\n
> *🔓* Gunakan \`open\` untuk membuka grup. Member dapat mengirim pesan dan berinteraksi dengan bebas.\n
> *🔒* Gunakan \`close\` untuk menutup grup. Hanya admin yang dapat mengirim pesan, member akan dibatasi.\n\n
*– 乂 Contoh Penggunaan:*\n
> *-* *${m.prefix + m.command} open* - Untuk membuka grup\n
> *-* *${m.prefix + m.command} close* - Untuk menutup grup\n\n
*– 乂 Penting!*\n
> *📌* Jika grup dibuka, semua member dapat berinteraksi.\n
> *📌* Jika grup ditutup, hanya admin yang dapat mengirim pesan.`;

    await sock
      .groupSettingUpdate(
        m.cht,
        text === "open" ? "not_announcement" : "announcement",
      )
      .then(() =>
        m.reply(
          `> ✅ *Berhasil ${text === "open" ? "membuka" : "menutup"} grup!* ${text === "open" ? "Sekarang member bisa mengirim pesan." : "Hanya admin yang dapat mengirim pesan sekarang."}`,
        ),
      );
  },
};
