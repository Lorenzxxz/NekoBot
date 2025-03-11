const fs = require('fs')
const path = require('path')
const { Client, GatewayIntentBits } = require('discord.js')
const axios = require('axios')
const config = require('@configuration')
const logger = require('./misc/logger.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
const PREFIX = '!'

const loadPlugins = (directory) => {
    let plugins = []
    const folders = fs.readdirSync(directory)
    folders.forEach(folder => {
        const folderPath = path.join(directory, folder)
        if (fs.lstatSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath)
            files.forEach(file => {
                const filePath = path.join(folderPath, file)
                if (filePath.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)]
                        const plugin = require(filePath)
                        plugin.filePath = filePath
                        plugins.push(plugin)
                    } catch (error) {}
                }
            })
        }
    })
    return plugins
}

const plugins = loadPlugins(path.resolve(__dirname, "./plugins"))

client.once('ready', () => {})

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return
    
    logger.logCommand(message);

    const args = message.content.slice(PREFIX.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    const context = { 
        client,
        message,
        args,
        command
    }

    let handled = false
    for (const plugin of plugins) {
        if (plugin.command && plugin.command.includes(command)) {
            try {
                await plugin.operate(context)
                handled = true
            } catch (error) {}
            break
        }
    }

    if (!handled) {
        switch (command) {
            case 'ping':
                message.reply('Pong!')
                break

            case 'hello':
                message.reply('Hello! How are you?')
                break

            case 'info':
                message.reply(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`)
                break

            case 'help':
                message.reply('Available commands:\n- `!ping`\n- `!hello`\n- `!info`\n- `!pixiv`\n- `!help`')
                break
            
            case 'pixiv':
                const swn = args.join(" ")
                const pcknm = swn.split("|")[0]
                const atnm = swn.split("|")[1] ? parseInt(swn.split("|")[1]) : 1

                if (!pcknm) {
                    message.reply(`Enter query\n\nExample: !image blue_archive`)
                    return
                }

                try {
                    const url = "https://www.pixiv.net/touch/ajax/search/illusts"
                    const header = {
                        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        'Accept': "application/json",
                        'Accept-Encoding': "gzip, deflate",
                        'x-user-id': "94263110",
                        'x-requested-with': "XMLHttpRequest",
                        'sec-fetch-site': "same-origin",
                        'sec-fetch-mode': "cors",
                        'sec-fetch-dest': "empty",
                        'accept-language': "en-US,en;q=0.9",
                        'Cookie': `first_visit_datetime=2024-04-03%2004%3A40%3A06; ...`
                    }
                    const params = {
                        'include_meta': "1",
                        's_mode': "s_tag",
                        'type': "all",
                        'word': pcknm,
                        'csw': "0",
                        'lang': "en",
                        'version': "08a9c37ead5e5b84906f6cbcdb92429ae5d13ac8"
                    }

                    let cnt = 0
                    const chuy = await axios.get(url, { params: params, headers: header })
                    let sifat = chuy.data.body.illusts

                    while (cnt < atnm) {
                        if (sifat.length < 1) {
                            message.reply('No Image Found.')
                            return
                        }

                        const randomIndex = Math.floor(Math.random() * sifat.length)
                        const sipat = sifat.splice(randomIndex, 1)[0]
                        const imageUrl = sipat.url

                        let tumbas_wedhus = await axios.get(imageUrl, {
                            headers: { referer: "https://pixiv.net" },
                            responseType: 'arraybuffer'
                        })
                        const imageBuffer = Buffer.from(tumbas_wedhus.data, 'binary')

                        await message.channel.send({
                            files: [{ attachment: imageBuffer, name: `${pcknm}.jpg` }]
                        })

                        cnt++
                    }
                } catch (error) {
                    message.reply("An error occurred.")
                }
                break

            default:
                message.reply('Unknown command. Use `!help` to see the list of commands.')
                break
        }
    }
})

//gabakal nampilin error kalo token discord gada
if (!config.discord || !config.discord.botToken || config.discord.botToken.trim() === "") {
} else {
    try {
        client.login(config.discord.botToken)
    } catch (error) {}
}