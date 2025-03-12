![Logo](https://files.catbox.moe/obf6o0.jpg)

**😼 NekoBot | 1.7.0** | ***create by Lorenzxz***


```> Simple WhatsApp bot Using Library Baileys```

## 👨‍💻 How to install/run

```bash
$ git clone https://github.com/AxellNetwork/NekoBot
$ cd NekoBot
$ npm install
$ npm start
```

```javascript
{
  message: Message { conversation: '>_ Welcome to NekoBot' },
  type: 'conversation',
  msg: '>_ Welcome to NekoBot',
  isMedia: false,
  key: {
    remoteJid: '6285165556936@s.whatsapp.net',
    participant: '6285165556936@s.whatsapp.net',
    fromMe: false,
    id: '5780C33F89C0BE600B6D71DF79C4FC02'
  },
  cht: '62123456789@s.whatsapp.net',
  fromMe: false,
  id: '5780C33F89C0BE600B6D71DF79C4FC02',
  device: 'android',
  isBot: false,
  isGroup: false,
  participant: '62123456789@s.whatsapp.net',
  sender: '62123456789@s.whatsapp.net',
  mentions: [],
  body: '>_ Welcome to NekoBot',
  prefix: '',
  command: '>_',
  args: [ 'Welcome', 'to', 'NekoBot' ],
  text: 'Welcome to NekoBot',
  isOwner: true,
  download: [AsyncFunction (anonymous)]
}
```

## 📁 Struktur Direktori
```javascript
│── system/whatsapp/plugins # Folder plugin whatsapp
│── utils/           # Library pendukung bot
│── index.js         # File utama
│── package.json     # Dependensi proyek
│── settings/configuration.js # Konfigurasi bot
```
## ⚙️ Settings Bot ***( settings.js )***

```javascript
const fs = require("fs");

const config = {
  owner: ["6283879020370", "6283879020370"],
  botNumber: "6283159168004",
  name: "- NekoBot - Simple WhatsApp bot",
  author: "Lorenzxz",
  sessions: "sessions",
  prefix: ["!", ".", "#", "/"], // Tambahkan prefix sesuai kebutuhan
  tz: "Asia/Jakarta",
  database: "neko-database", 
  PORT: 3000,
  
  inviteCode: "CtnxNzmlxLOJqeSlxdQXTz",
  
  id: {
    group: "1@g.us",
    newsletter: "1@newsletter",
  },
  
  style: {
    bold: (text) => `*${text}*`,
    italic: (text) => `_${text}_`,
    strikethrough: (text) => `~${text}~`,
    monospace: (text) => `\`\`\`${text}\`\`\``,
    boldItalic: (text) => `_*${text}*_`,
    boldUnderline: (text) => `**_${text}_**`,
    quote: (text) => `> ${text}`,
    bullet: (text) => `• ${text}`,
    number: (num, text) => `${num}. ${text}`
  },

  settings: {
    antiCall: true,
    autoFollowNewsletter: false,
    autoGoodbye: false,
    autoJoinGc: false,
    autoTyping: false,
    autoWelcome: false,
    dmOnly: false,
    groupOnly: false,
    online: false,
    readChat: false,
    readSw: false,
    reactSw: false,
    statusOnly: false,
  },

  messages: {
    call: "> 🚫 *Mohon maaf*... Kami tidak bisa menerima telepon dari Anda, anti call aktif!",
    unregistered: "> ❎ *Mohon maaf*... Anda belum terdaftar dalam database kami, silahkan daftar agar Anda dapat menggunakan fitur ini.\n\n> Ketik .daftar [nama Anda] agar Anda terdaftar.",    
    wait: "> ⏳ *Mohon tunggu sebentar*... Kami sedang memproses permintaan Anda, harap bersabar ya!", 
    maintenance: "> 🚧 *Fitur sedang dalam pemeliharaan*... Mohon tunggu hingga perbaikan selesai.",
    owner: "> 🧑‍💻 *Fitur ini hanya untuk pemilik bot*... Maaf, Anda tidak memiliki akses ke fitur ini.", 
    admin: "> 👮 *Fitur ini hanya untuk Admin Grup*... Pastikan Anda adalah admin untuk menggunakannya.",
    botAdmin: "> ⚠️ *Bot harus menjadi admin grup*... Berikan hak admin kepada bot untuk menggunakan fitur ini.", 
    group: "> 👥 *Fitur ini hanya tersedia di grup*... Pastikan Anda berada di grup WhatsApp untuk mengakses fitur ini.",
    private: "> 🔒 *Fitur ini hanya tersedia di chat pribadi*... Gunakan di chat pribadi dengan bot.",
    premium: "> 🥇 *Upgrade ke Premium* untuk mendapatkan akses ke fitur eksklusif, murah dan cepat! Hubungi admin untuk info lebih lanjut.", 
    error: "> ❌ *Terjadi kesalahan*... Silakan laporkan kepada pemilik bot untuk diperbaiki.",
    errorlink: "> 🔗 *Harap masukkan URL yang valid*... URL harus dimulai dengan 'https://'.",
    success: "> ✅ *Berhasil!*... Permintaan Anda telah diproses dengan sukses.",
    done: "> 🎉 *Selesai!*... Terima kasih sudah menggunakan fitur ini!",
    example: "> ❎ *Contoh Penggunaan Fitur*",
    badwords: "> ❎ *Mohon maaf*... Anda tidak diperbolehkan berkata kasar disini, saya akan menghapus pedan anda"
},

  sticker: {
    packname: "✨ NekoPack ✨", 
    author: "🐾 Lorenzxz 🐾", 
    packId: "https://github.com/Lorenzxz",    
    email: "lorenzxz@gmail.com",
    website: "https://github.com/Lorenzxz",
    androidApp: "https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro",
    iOSApp: "https://apps.apple.com/id/app/muslim-pro-al-quran-adzan/id388389451?|=id",
    emojis: [],
    isAvatar: 0,
  },

  bot: {
    discord: false,
    discord_userbot: false,    
    telegram: false,
    telegram_userbot: false,
    twitter: false,    
    whatsapp: true,
  }, // True = activate, False = turn off
  
  discord: {    
    accountToken: "",
    allowedUserIDs: ['#', '#', '#'], // This is user id for accessing discord userbot
    botToken: "",
    prefix: ".", 
  },
  
  telegram: {
    api_id: "",
    api_hash: "",
    sessionFile: "sessions/sessions.json",
    token: "", // Opsional
    ownerID: "", // Opsional
  },

  twitter: {
    appKey: "",
    appSecret: "",
    accessToken: "",
    accessSecret: "",
    botUserId: "",
    pollingInterval: 60000,
  },
};

module.exports = config;
```

## ☘️ Example Features
Berikut cara menambahkan fitur pada bot ini

## 1. Plugins

```javascript

module.exports = {
    command: "tes", //- Nama fitur nya
    alias: ["tesbot", "testing"], //- Short cut command
    category: ["main"], //- Kategori Fitur 
    settings: {
        owner: false, //-  Apakah Fitur ini khusus owner ?
        group: false, // - Apakah Fitur ini khusus group ?
     },
    description: "Tes bot saja", //- Penjelasan tentang fitur nya
    loading: true, //- Ingin menambahkan loading messages ?
 async run(m, { sock, Func, Scraper, text, config }) {
    m.reply("> Bot Online ✓")
  }
}
```
## 2. Case

```javascript
case "tes" : {
     m.reply("> Bot Online ✓")
   }
break
```

## 📢 Information 
Jika ingin mengenal seputar Script ini lebih dalam lagi
silahkan mampir ke komunitas kami

[![WhatsApp channel](https://img.shields.io/badge/WhatsApp%20Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb7LOlf2UPBCHaPGx10P)

## ❤️ Thanks To
- `AxellNetwork`: Base
- `Bayu Mahadika`: Referensi
- `KyuuRzy`: Referensi
- `Zanspiw`: Reviewer
- `Fizzxy`: Baileys

