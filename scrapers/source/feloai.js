const axios = require("axios");

const felo = async function (query) {
  const headers = {
    Accept: "*/*",
    "User-Agent": "Postify/1.0.0",
    "Content-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json",
  };

  const generateUUID = () => {
    return (
      Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2)
    );
  };

  const payload = {
    query,
    search_uuid: generateUUID(),
    search_options: {
      langcode: "id-MM",
    },
    search_video: true,
  };

  const request = (badi) => {
    const result = {
      answer: "",
      source: [],
    };
    badi.split("\n").forEach((line) => {
      if (line.startsWith("data:")) {
        try {
          const data = JSON.parse(line.slice(5).trim());
          if (data.data) {
            if (data.data.text) {
              result.answer = data.data.text
                .replace(/\*\*(.*?)\*\*/g, "*$1*")
                .replace(/^#{2,3}\s+/g, "")
                .split("\n")
                .map((line) => line.replace(/^#{2,3}\s+/g, "> "))
                .join("\n");
            }
            if (data.data.sources) {
              result.source = data.data.sources;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
    return result;
  };

  try {
    const response = await axios.post(
      "https://api.felo.ai/search/threads",
      payload,
      {
        headers,
        timeout: 30000,
        responseType: "text",
      },
    );

    return request(response.data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = felo;
