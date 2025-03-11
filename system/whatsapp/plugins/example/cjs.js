module.exports = {
  command: "cjs",
  alias: ["cjs"],
  description: "Example command using cjs",
  settings: {
    loading: true,
  },
  async run(m, { text, sock }) {
    m.reply(`Hello, this command using cjs`);
  }
};