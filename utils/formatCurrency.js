module.exports = (number, currency) =>
  new Intl.NumberFormat(global.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
