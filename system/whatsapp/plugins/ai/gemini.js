const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");

module.exports = {
  command: "gemini",
  alias: [],
  category: ["ai"],
  description: "Chat dgn gemini",
  async run(m, { text }) {
    if (!m.text) return m.reply("> mana m.textnya?");
    m.react("🕐");
    let q = m.quoted ? m.quoted : m;
    try {
      if (
        /image|video|audio/.test(q.msg.mimetype) ||
        /application\/pdf/.test(q.msg.mimetype)
      ) {
        let media = await q.download();
        const { ext } = await fromBuffer(media);
        const filename = `./file_${Date.now()}.${ext}`;
        fs.writeFileSync(filename, media);
        const formData = new FormData();
        formData.append("content", text);
        formData.append("model", "gemini-1.5-flash");
        formData.append("file", fs.createReadStream(filename));
        const { data } = await axios.post("https://hydrooo.web.id/", formData);
        fs.unlinkSync(filename);
        m.reply(data.result);
      } else {
        const formData = new FormData();
        formData.append("content", text);
        formData.append("model", "gemini-1.5-flash");
        const { data } = await axios.post("https://hydrooo.web.id/", formData);
        m.reply(data.result);
      }
    } catch (err) {
      console.log(err);
      m.reply(`Error dikit ga ngaruh`);
    }
  },
};
