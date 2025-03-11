const { Client } = require('discord.js-selfbot-v13');
const config = require('@configuration');
const readyHandler = require('./handlers/ready');
const messageCreateHandler = require('./handlers/messageCreate');
const commandHandler = require('./handlers/commandHandler');
const crashHandler = require('./handlers/crash-handler');
const { targetServerID } = require('./handlers/check'); 

const client = new Client();

readyHandler(client);
messageCreateHandler(client);
crashHandler(client);

commandHandler.loadCommands();

client.once('ready', async () => {
});

client.login(config.discord.accountToken).catch(console.error);