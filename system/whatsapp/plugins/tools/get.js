const undici = require("undici");
const { html } = require("js-beautify");
const { extension } = require("mime-types");

module.exports = {
  command: "get",
  alias: ["fetch"],
  category: ["tools"],
  description: "🔍 Mendapatkan data dari URL yang diberikan",
  loading: true,
  async run(m, { sock, Func, text, config }) {
    if (!text)
      throw "> ❌ Masukan atau reply URL yang ingin kamu ambil datanya";

    const urls = isUrl(text);
    if (!urls)
      throw "> ❌ Format URL tidak valid, pastikan URL yang dimasukkan benar";

    for (const url of urls) {
      try {
        const response = await undici.fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const mime = response.headers.get("content-type").split(";")[0];
        const cap = `*– 乂 Fetch - Url*\n> *- Request :* ${url}`;
        let body;

        if (/\html/gi.test(mime)) {
          body = await response.text();
          await sock.sendMessage(
            m.cht,
            {
              document: Buffer.from(html(body)),
              caption: cap,
              fileName: "result.html",
              mimetype: mime,
            },
            { quoted: m },
          );
        } else if (/\json/gi.test(mime)) {
          body = await response.json();
          m.reply(JSON.stringify(body, null, 2));
        } else if (/image/gi.test(mime)) {
          body = await response.arrayBuffer();
          sock.sendFile(
            m.cht,
            Buffer.from(body),
            `result.${extension(mime)}`,
            cap,
            m,
          );
        } else if (/video/gi.test(mime)) {
          body = await response.arrayBuffer();
          sock.sendFile(
            m.cht,
            Buffer.from(body),
            `result.${extension(mime)}`,
            cap,
            m,
          );
        } else if (/audio/gi.test(mime)) {
          body = await response.arrayBuffer();
          sock.sendFile(
            m.cht,
            Buffer.from(body),
            `result.${extension(mime)}`,
            cap,
            m,
            { mimetype: mime },
          );
        } else {
          body = await response.text();
          m.reply(Func.jsonFormat(body));
        }
      } catch (error) {
        console.error("Error fetching URL:", error);
        m.reply(`> ❌ Terjadi kesalahan saat mengambil URL: ${error.message}`);
      }
    }
  },
};

function isUrl(string) {
  let urlRegex =
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
  let result = string.match(urlRegex);
  return result;
}
