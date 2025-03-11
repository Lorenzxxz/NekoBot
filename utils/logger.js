// REFERENCES COLOR uniq
// https://tforgione.fr/posts/ansi-escape-codes/
// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797#8-16-colors
const getDate = require("./getDate");
const getTime = require("./getTime");

module.exports = (type, title, mess) => {
  let color = 0;
  switch (type.toLowerCase()) {
    case "success":
      color = 2;
      break;
    case "primary":
      color = 4;
      break;
    case "info":
      color = 6;
      break;
    case "warning":
      color = 3;
      break;
    case "error":
      color = 1;
      break;
    default:
      color = Math.floor(Math.random() * 10);
      break;
  }
  console.log(
    `\x1b[1;4${color}m\x20${
      global.name
    }\x20\x1b[0m\x20\x20${getTime()}\x20\x20\x1b[1;4${color}m\x20\x1b[0m\n\x1b[1;4${color}m\x20\x1b[0m\x20${getDate()}\x20\x1b[1;4${color}m\x20\x1b[0m\n\x1b[1;4${color}m\x20${title}\x20\x1b[0m\x20\x20${mess}\x20\x1b[1;4${color}m\x20\x1b[0m\n`
  );
};
