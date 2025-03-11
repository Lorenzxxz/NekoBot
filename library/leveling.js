const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) {
    throw new TypeError("Level tidak boleh negatif");
  }
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return { min, max, xp: max - min };
}

function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === 1 / 0) return 1 / 0;
  if (isNaN(xp)) return NaN;
  if (xp <= 0) return -1;
  let level = 0;
  do {
    level++;
  } while (xpRange(level, multiplier).min <= xp);
  return --level;
}

function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  return level >= 0 && (xp === 1 / 0 || (!isNaN(xp) && xp > 0 && level < findLevel(xp, multiplier)));
}

module.exports = {
  growth,
  xpRange,
  findLevel,
  canLevelUp
};