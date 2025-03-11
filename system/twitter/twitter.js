const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const chalk = require('chalk');
const config = require('../../settings/configuration.js');
const log = require('./misc/logger.js');

const client = new TwitterApi({
  appKey: config.twitter.appKey,
  appSecret: config.twitter.appSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
});

const lastReplied = new Set();

async function getAIResponse(text) {
  try {
    const { data } = await axios.post("https://ai.clauodflare.workers.dev/chat", {
      model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
      messages: [{ role: "user", content: text }]
    });

    if (!data.success) return "Maaf, saya tidak dapat menjawab saat ini.";
    return data.data.response.split("</think>").pop().trim();
  } catch (error) {
    console.error(chalk.red.bold("❌ Error mendapatkan dari balasan AI:"), error.message);
    return "Terjadi kesalahan, coba lagi nanti!";
  }
}

async function checkMentions() {
  try {
    const response = await client.v2.search(`@mfkygy`, {
      'tweet.fields': ['id', 'author_id', 'text'],
      expansions: ['author_id'],
      max_results: 10,
    });

    for (const tweet of response.data.data) {
      const tweetId = tweet.id;
      const userId = tweet.author_id;
      const tweetText = tweet.text;

      if (lastReplied.has(tweetId) || userId === config.twitter.botUserId) continue;

      const user = await client.v2.userById(userId);
      const username = user.data.username;

      log({ username, userId, tweetId, text: tweetText });

      const aiReply = await getAIResponse(tweetText);

      await client.v2.reply(aiReply, tweetId);

      lastReplied.add(tweetId);
    }
  } catch (error) {
    console.error(chalk.red.bold("❌ Error membaca mention:"), error.message);
  }
}

async function start() {
  setInterval(checkMentions, config.twitter.pollingInterval);
}

start();