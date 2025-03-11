const fs = require('fs');
const path = require('path');

const commands = [];

module.exports = {
    loadCommands: () => {
        const commandDir = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(commandDir, file);
            const command = require(commandPath);
            commands.push(command);
        }
    },
    getCommand: (commandName) => {
        return commands.find(cmd => cmd.name === commandName);
    }
};