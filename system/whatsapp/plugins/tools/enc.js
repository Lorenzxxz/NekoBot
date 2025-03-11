module.exports = {
  command: "enc",
  alias: ["encrip"],
  category: ["owner"],
  settings: {
    limit: true,
  },
  description: "🔒 Enkripsi pesan yang dibalas untuk meningkatkan keamanan",
  async run(m, { sock }) {
    if (!m.quoted) throw "> ❌ Balas pesan yang ingin dienkripsi";
    let encryptedMessage = encrypt(m.quoted.body);
    m.reply(
      `> 🔐 Pesan berhasil dienkripsi: \n\n\`\`\`${encryptedMessage}\`\`\``,
    );
  },
};

let data = require("javascript-obfuscator");

function encrypt(message) {
  let result = data.obfuscate(message, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1,
  });
  return result.getObfuscatedCode();
}
