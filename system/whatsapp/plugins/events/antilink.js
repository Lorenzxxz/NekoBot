const { getUrlInfo } = require("baileys");

async function events(m, { sock, Func }) {
  if (!m.isGroup) return;
  let group = db.list().group[m.cht];
  if (Func.isUrl(m.body) && /chat.whatsapp.com/.test(m.body)) {
    if (!m.isBotAdmin || m.isAdmin) return;
    let msg = `*🚫 Link Grup Terdeteksi!*\n\n`;
    msg += m.isAdmin
      ? `> Anda aman karena Anda adalah admin dari grup *${m.metadata.subject}*.\n\nTerima kasih telah mematuhi aturan grup! 😊`
      : `> Maaf, mengirim link grup lain tidak diperbolehkan di grup *${m.metadata.subject}*.\n\nPesan Anda akan dihapus untuk menjaga keamanan dan kenyamanan bersama. Terima kasih atas pengertiannya! 🙏`;

    await m.reply(msg);
    await sock.sendMessage(m.cht, { delete: m.key });
  }
}

module.exports = {
  events,
};
