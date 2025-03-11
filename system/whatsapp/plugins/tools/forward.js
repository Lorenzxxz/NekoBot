const path = require("node:path");
const serialize = require(path.resolve("./library/serialize.js"));

module.exports = {
  command: "quoted",
  alias: ["q"],
  category: ["tools"],
  settings: {
    limit: true,
  },
  description: "🔁 Meneruskan pesan yang dibalas oleh pengguna",
  async run(m, { sock, store }) {
    if (!m.quoted) throw "> ❌ Balas pesan yang ingin diteruskan";

    let loadMsg = await store.loadMessage(m.cht, m.quoted.id);
    if (!loadMsg?.message) throw "> ❌ Tidak ada pesan yang diteruskan";

    let data = await serialize(loadMsg, sock, store);
    if (!data?.quoted) throw "> ❌ Tidak ada pesan yang diteruskan";

    sock.copyNForward(m.sender, data.quoted, true);
  },
};