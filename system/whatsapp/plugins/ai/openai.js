module.exports = {
  command: "ai",
  alias: ["openai", "gpt", "gpt4"],
  category: ["ai"],
  description: "Jawab semua pertanyaanmu dengan AI",
  settings: {
  loading: true,
  },
  async run(m, { text, sock, Scraper }) {

    if (!text) throw "> Masukkan pernyataannya";
    
    let data = await Scraper.chatbot.send(
      [
        {
          role: "user",
          content: text,
        },
        {
          role: "system",
          content: "Kamu sekarang adalah NekoBot, Bot asisten yang diciptakan oleh Lorenzxz",
        },
      ],
      "gpt-3.5-turbo"
    );

    if (!data.choices) return m.reply("> Gagal mendapatkan respons dari ChatGPT");
    m.reply(data.choices[0].message.content.trim());
  }
};