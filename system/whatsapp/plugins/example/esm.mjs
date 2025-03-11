export default {
  command: "esm",
  alias: ["esm"],
  description: "Example command using esm",
  settings: {
  loading: true,
  },
  async run(m, { text, sock }) {

  m.reply(`Hello, this command using esm`);

  }
};