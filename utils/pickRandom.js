const pickRandom = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
};

module.exports = pickRandom;