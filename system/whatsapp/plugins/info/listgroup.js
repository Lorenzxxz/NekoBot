module.exports = {
  command: "listgroup",
  alias: ["gcl", "listgroup"],
  category: ["info"],
  settings: {
    limit: true,
    owner: true,
  },
  description: "📋 Menampilkan daftar grup yang dikelola oleh bot",
  async run(m, { sock, Func, store }) {
    let data = Object.values(store.groupMetadata);
    let cap = "*– 乂 Daftar Group Bot*\n\n";
    cap += `> 📊 *Total Grup:* ${data.length}\n\n`;

    if (data.length === 0) {
      return m.reply("> ❌ *Tidak ada grup yang terdaftar di bot ini.*");
    }

    cap += data
      .sort((a, b) => b.creation - a.creation)
      .map((a, i) => {
        let owner = a.owner ? "@" + a.owner.split("@")[0] : "Tidak ada pemilik";
        return (
          `> *${i + 1}.* ${a.subject}\n` +
          `> ⏳ *Dibuat:* ${Func.ago(a.creation * 1000)}\n` +
          `> 👥 *Jumlah Member:* ${a.size}\n` +
          `> 👑 *Pemilik:* ${owner}`
        );
      })
      .join("\n\n");

    m.reply(cap);
  },
};
