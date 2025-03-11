const chalk = require("chalk");

module.exports = ({ username, userId, tweetId, text }) => {
    const tag = chalk.blue.bold("[ TWITTER ]");
    const divider = chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let info = `\n${tag} ${chalk.magenta.bold("NEW MENTION RECEIVED")}\n`;
    info += `${divider}\n`;
    info += chalk.white.bold("🙋 User      : ") + chalk.magenta.bold(`@${username}`) + "\n";
    info += chalk.white.bold("🆔 User ID   : ") + chalk.blue.bold(userId) + "\n";
    info += chalk.white.bold("🐦 Tweet ID  : ") + chalk.green.bold(tweetId) + "\n";
    info += `${divider}\n`;

    const body = chalk.bgYellow.black.bold(` ✏️ Pesan: ${text} `);
    info += `${body}\n`;
    info += `${divider}\n`;

    console.log(info);
};