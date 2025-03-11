module.exports = (date) =>
  new Date(date).toLocaleDateString(global.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
