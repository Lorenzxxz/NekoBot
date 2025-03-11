const moment = require("moment-timezone");

module.exports = () => {
  moment.locale(global.locale || "id-ID");
  return moment.tz(global.timezone || "id-ID").format("dddd, DD MMMM YYYY");
};
