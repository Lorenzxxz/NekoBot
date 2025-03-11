const fs = require("fs");
const path = require("path");
const config = require("@configuration");
const logger = require("./logger.js");

module.exports = (client) => {
    const pluginsPath = path.join(__dirname, "../plugins");
    const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));
    const commands = {};

    pluginFiles.forEach(file => {
        const plugin = require(path.join(pluginsPath, file));
        if (typeof plugin !== "object" || !plugin.command) {
            console.error(`❌ Plugin ${file} tidak memiliki format yang benar!`);
            return;
        }

        plugin.command.forEach(cmd => {
            commands[cmd] = plugin;
        });
    });

    client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.message) return;

        logger(message);

        let args = message.message.trim().split(/\s+/);
        let command = args.shift().toLowerCase();
        let text = args.join(" ");

        const handler = commands[command];
        if (!handler) return;

        if (handler.owner && parseInt(message.senderId) !== parseInt(config.telegram.ownerID)) {
            return client.sendMessage(message.peerId, {
                message: "Access denied, you are not the owner",
                replyTo: message.id
            });
        }

        await handler.run({
            client,
            text,
            reply: (msg) => client.sendMessage(message.peerId, { 
                message: msg, 
                replyTo: message.id 
            }),
            message
        });
    });
};