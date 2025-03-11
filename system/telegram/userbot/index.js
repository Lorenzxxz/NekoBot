const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");
const input = require("input");
const config = require("@configuration");
const loadPlugins = require("./misc/loader.js");

let sessionString = fs.existsSync(config.telegram.sessionFile) ? fs.readFileSync(config.telegram.sessionFile, "utf8") : "";
const session = new StringSession(sessionString);

async function main() {    
    const client = new TelegramClient(session, config.telegram.api_id, config.telegram.api_hash, { 
    connectionRetries: 5 
    });

    await client.start({
        phoneNumber: async () => await input.text("📲 Masukkan nomor Telegram Anda: "),
        password: async () => await input.text("🔑 Masukkan password akun Telegram (jika ada): "),
        phoneCode: async () => await input.text("📩 Masukkan kode OTP: "),
        onError: (err) => console.log("❌ Error: ", err),
    });

    fs.writeFileSync(config.telegram.sessionFile, client.session.save(), "utf8");
    await client.sendMessage("me", { message: "✅ Userbot berhasil login dan tersimpan!" });
    loadPlugins(client);
}

main();