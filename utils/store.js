const { makeInMemoryStore } = require('@whiskeysockets/baileys')
const pino = require('pino')

const store = makeInMemoryStore({ logger: pino().child({ level: 'fatal', stream: 'store' }) })

module.exports = store