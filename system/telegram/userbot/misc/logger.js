const chalk = require("chalk");

module.exports = async (client, message) => {
    const tag = chalk.cyan.bold("[ TELEGRAM USERBOT ]");
    const divider = chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let info = "";
    info += `\n${tag} ${chalk.magenta.bold("NEW MESSAGE RECEIVED")}\n`;
    info += `${divider}\n`;

    let userId = "Unknown";

    try {
        if (message.fromId) {
            userId = message.fromId.userId || message.fromId.channelId || "Unknown";
        }
    } catch (error) {
        console.log(chalk.red("⚠️ Gagal mendapatkan ID pengirim"), error);
    }

    info += chalk.white.bold("🆔 User ID   : ") + chalk.blue.bold(userId) + "\n";
    info += chalk.white.bold("📅 Tanggal   : ") + chalk.cyan.bold(new Date().toLocaleString()) + "\n";
    info += `${divider}\n`;

    const body = message.message
        ? chalk.bgYellow.black.bold(` ✏️ Pesan: ${message.message} `)
        : chalk.bgBlue.white.bold(` 📂 Media/File Terkirim `);

    info += `${body}\n`;
    info += `${divider}\n`;

    console.log(info);
};