const axios = require("axios");

class Command {
    constructor() {
        this.command = "deepseek";
        this.alias = [];
        this.category = ["ai"];
        this.settings = {
            limit: true
        };
        this.description = "Tanya jawab Bersama deepseek 🐋";
        this.loading = true;
    }
    run = async (m, {
        sock,
        Func,
        Scraper,
        config,
        store,
        text
    }) => {
        if (!text) throw "Masukan Pertanyaan nya 📝"
        let {
            data
        } = await axios.post("https://ai.clauodflare.workers.dev/chat", {
            "model": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
            "messages": [{
                "role": "user",
                "content": text
            }]
        }).catch(e => e.response);
        if (!data.success) throw Func.jsonFormat(data);
        let response = data.data.response.split("</think>").pop().trim();
        m.reply(response);
    };
}

module.exports = new Command();