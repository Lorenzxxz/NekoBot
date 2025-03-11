const chalk = require("chalk");

module.exports = (ctx) => {
    const tag = chalk.cyan.bold("[ TELEGRAM ]");
    const divider = chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let info = "";
    info += `\n${tag} ${chalk.magenta.bold("NEW MESSAGE RECEIVED")}\n`;
    info += `${divider}\n`;
    info += chalk.white.bold("🗨️Dari      : ") + 
        chalk.green.bold(ctx.chat.type === "private" ? "Private Chat" : "Group Chat") + "\n";

    if (ctx.chat.type !== "private") {
        info += chalk.white.bold("👥 Group Name: ") + chalk.yellow.bold(ctx.chat.title) + "\n";
    }

    info += chalk.white.bold("🙋 Nama      : ") + chalk.magenta.bold(ctx.from.first_name || "Unknown") + "\n";
    info += chalk.white.bold("🆔 User ID   : ") + chalk.blue.bold(ctx.from.id) + "\n";
    info += `${divider}\n`;

    const body = ctx.message.text
        ? chalk.bgYellow.black.bold(` ✏️ Pesan: ${ctx.message.text} `)
        : chalk.bgBlue.white.bold(` 📂 Media/File Terkirim `);

    info += `${body}\n`;
    info += `${divider}\n`;

    console.log(info);
};