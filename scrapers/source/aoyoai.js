const axios = require("axios");
const qs = require("querystring");
const { randomUUID, randomBytes } = require("crypto");

async function aoyoAi(content) {
  async function getSearchResults(query) {
    const url = "https://aoyo.ai/Api/AISearch/Source";
    const requestData = { q: query, num: 20, hl: "id-ID" };
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json, text/plain, */*",
    };

    try {
      const response = await axios.post(url, qs.stringify(requestData), {
        headers,
      });
      return response.data.organic || [];
    } catch (error) {
      console.error("Error fetching search results:", error.message);
      return [];
    }
  }

  const url = "https://aoyo.ai/Api/AISearch/AISearch";
  const searchResults = await getSearchResults(content);
  const hasilPencarian = searchResults.map((result) => ({
    judul: result.title,
    link: result.link,
    snippet: result.snippet,
  }));

  const requestData = {
    content,
    id: randomUUID(),
    language: "id-ID",
    engineContent: JSON.stringify(hasilPencarian),
    randomNumber: randomBytes(8).toString("hex"),
  };

  try {
    const response = await axios.post(url, qs.stringify(requestData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.data) throw new Error("No data received from API");

    const hasil = {
      hasil_pencarian: hasilPencarian,
      jawaban: response.data.replace(/\[START\][\s\S]*$/g, "").trim(),
    };

    return hasil;
  } catch (error) {
    console.error("Error in aoyoAi:", error.message);
    return { error: error.message };
  }
}

module.exports = aoyoAi;
