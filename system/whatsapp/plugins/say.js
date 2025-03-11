class Commands {
      constructor() {
        this.command = ["say"];
        this.alias = ['say'];
        this.description = ["Toold kirim text"];
        this.loading = true;
      }

      async run(m, { sock }) {
  if(!m.text) return m.reply("Masukan Textnya!");
  m.reply(m.text);
      }
    }

module.exports = new Commands();