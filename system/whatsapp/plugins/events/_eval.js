const { exec } = require("child_process");
const util = require("node:util");

async function events(
  m,
  {
    sock,
    config,
    text,
    plugins,
    Func,
    Scraper,
    Uploader,
    store,
    isAdmin,
    botAdmin,
    isPrems,
    isBanned,
  },
) {
  if (
    [">", "eval", "=>"].some((a) => m.command.toLowerCase().startsWith(a)) &&
    m.isOwner
  ) {
    let evalCmd = "";
    try {
      evalCmd = /await/i.test(m.text)
        ? eval("(async() => { " + m.text + " })()")
        : eval(m.text);
    } catch (e) {
      evalCmd = e;
    }
    new Promise((resolve, reject) => {
      try {
        resolve(evalCmd);
      } catch (err) {
        reject(err);
      }
    })
      ?.then((res) => m.reply(util.format(res)))
      ?.catch((err) => m.reply(util.format(err)));
  }
  if (
    ["$", "exec"].some((a) => m.command.toLowerCase().startsWith(a)) &&
    m.isOwner
  ) {
    try {
      exec(m.text, async (err, stdout) => {
        if (err) return m.reply(util.format(err));
        if (stdout) return m.reply(util.format(stdout));
      });
    } catch (e) {
      await m.reply(util.format(e));
    }
  }
}

module.exports = {
  events,
};
