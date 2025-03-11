const { delay } = require("baileys");
const DELAY = 10000;

module.exports = {
  command: "broadcast",
  alias: ["bc"],
  settings: { owner: true },
  description: "Mengirim pesan ke semua kontak atau grup",
  async run(m, { sock, store, text }) {
    if (!text) {
      throw `*╭──[ 乂 BROADCAST - USAGE ]*
᎒⊸ Masukkan pesan yang ingin di-broadcast.
᎒⊸ Reply media jika ingin mengirim pesan dengan media.
᎒⊸ Gunakan *\`--group\`* untuk mengirim pesan ke semua grup.
*╰────────────•*`;
    }

    const MSG = Object.keys(store.messages);
    const groupChats = MSG.filter((id) => id.endsWith("@g.us"));
    const privateChats = MSG.filter((id) => id.endsWith("@s.whatsapp.net"));

    if (text.includes("--group")) {
      let input = text.replace("--group", "").trim();
      if (!groupChats.length)
        throw "*❌ Tidak ada grup ditemukan untuk broadcast.*";
      let q = m.quoted || m;
      let Msg = sock.cMod(m.cht, q, input);

      let successCount = 0;
      for (let groupId of groupChats) {
        try {
          await sock.copyNForward(groupId, Msg, true);
          successCount++;
          await delay(DELAY);
        } catch (error) {
          console.error(`❌ Gagal mengirim ke grup ${groupId}:`, error.message);
        }
      }
      m.reply(
        `*╭──[ 乂 BROADCAST - GRUP ]*
᎒⊸ Total Grup: *${groupChats.length}*
᎒⊸ Berhasil Terkirim: *${successCount}*
*╰────────────•*`,
      );
    } else {
      if (!privateChats.length)
        throw "*❌ Tidak ada kontak ditemukan untuk broadcast.*";
      let q = m.quoted || m;
      let Msg = sock.cMod(m.cht, q, text);

      let successCount = 0;
      for (let contactId of privateChats) {
        try {
          await sock.copyNForward(contactId, Msg, true);
          successCount++;
          await delay(DELAY);
        } catch (error) {
          console.error(
            `❌ Gagal mengirim ke kontak ${contactId}:`,
            error.message,
          );
        }
      }
      m.reply(
        `*╭──[ 乂 BROADCAST - USER ]*
᎒⊸ Total Kontak: *${privateChats.length}*
᎒⊸ Berhasil Terkirim: *${successCount}*
*╰────────────•*`,
      );
    }
  },
};
