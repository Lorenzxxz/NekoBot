const chalk = require("chalk");

module.exports = {
    logCommand: (message) => {
        const tag = chalk.green.bold("[ DISCORD ]");
        const divider = chalk.magenta.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        let info = `\n${tag} ${chalk.cyan.bold("NEW COMMAND RECEIVED")}\n`;
        info += `${divider}\n`;
        info += chalk.white.bold("🆔 User      : ") + chalk.magenta.bold(message.author.username) + "\n";
        info += chalk.white.bold("🏷️ User ID   : ") + chalk.yellow.bold(message.author.id) + "\n";
        info += chalk.white.bold("📌 Channel   : ") + chalk.blue.bold(message.channel.name || "DM") + "\n";
        info += chalk.white.bold("💬 Command   : ") + chalk.cyan.bold(message.content) + "\n";
        info += `${divider}\n`;

        console.log(info);
    },

    logEvent: (event) => {
        const tag = chalk.green.bold("[ DISCORD ]");
        const divider = chalk.magenta.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        let info = `\n${tag} ${chalk.cyan.bold("EVENT TRIGGERED")}\n`;
        info += `${divider}\n`;
        info += chalk.white.bold("📢 Event      : ") + chalk.blue.bold(event) + "\n";
        info += `${divider}\n`;

        console.log(info);
    },

    logError: (error) => {
        const tag = chalk.red.bold("[ ERROR ]");
        const divider = chalk.magenta.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        let info = `\n${tag} ${chalk.red.bold("AN ERROR OCCURRED")}\n`;
        info += `${divider}\n`;
        info += chalk.white.bold("⚠️ Message  : ") + chalk.yellow.bold(error.message) + "\n";
        info += chalk.white.bold("📂 Stack    : ") + chalk.gray.bold(error.stack) + "\n";
        info += `${divider}\n`;

        console.log(info);
    }
};