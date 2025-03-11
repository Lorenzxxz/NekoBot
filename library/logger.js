const color = require("chalk");

module.exports = (m) => {
    const tag = color.green.bold("[ WHATSAPP ]");
    const divider = color.magenta.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let info = `\n${tag} ${color.cyan.bold("NEW MESSAGE RECEIVED")}\n`;
    info += `${divider}\n`;
    info += color.white.bold("🗨️Dari      : ") + 
            color.green.bold(m.isGroup ? "Group Chat" : "Private Chat") + "\n";

    if (m.isGroup) {
        info += color.white.bold("👥 Group Name: ") + color.yellow.bold(m.metadata.subject) + "\n";
    }

    info += color.white.bold("📂 Tipe      : ") + color.blue.bold(m.type) + "\n";
    info += color.white.bold("🙋 Nama      : ") + color.magenta.bold(m.pushName) + "\n";
    info += `${divider}\n`;

    const body = m.body
        ? color.bgYellow.black.bold(` ✏️ Pesan: ${m.body} `)
        : color.bgBlue.white.bold(` 📂 Media/File Terkirim `);

    info += `${body}\n`;
    info += `${divider}\n`;

    console.log(info);
};