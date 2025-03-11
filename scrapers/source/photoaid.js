const axios = require("axios");
const fs = require("fs");

async function photoaid(imageInput, type) {
  const headers = {
    authority: "photoaid.com",
    accept: "*/*",
    origin: "https://photoaid.com",
    "user-agent": "Postify/1.0.0",
  };

  const endpoints = {
    enlarger: {
      upload: "/ai-image-enlarger/upload",
      result: "/ai-image-enlarger/result",
      referer: "https://photoaid.com/en/tools/ai-image-enlarger",
    },
    relighting: {
      upload: "/relighting/upload",
      result: "/relighting/result",
      referer: "https://photoaid.com/en/tools/remove-shadow",
    },
    removebg: {
      upload: "/remove-background/upload",
      result: "/remove-background/result",
      referer: "https://photoaid.com/en/tools/remove-background",
    },
  };

  try {
    const tokenResponse = await axios.post(
      "https://photoaid.com/en/tools/api/tools/token",
      {},
      {
        headers: { ...headers, referer: "https://photoaid.com" },
      },
    );
    const token = tokenResponse.data.token;

    let base64Image;
    if (typeof imageInput === "string" && imageInput.startsWith("http")) {
      const response = await axios.get(imageInput, {
        responseType: "arraybuffer",
      });
      base64Image = Buffer.from(response.data).toString("base64");
    } else if (Buffer.isBuffer(imageInput)) {
      base64Image = imageInput.toString("base64");
    } else if (typeof imageInput === "string" && fs.existsSync(imageInput)) {
      base64Image = fs.readFileSync(imageInput).toString("base64");
    } else if (typeof imageInput === "string") {
      base64Image = imageInput;
    } else {
      throw new Error("Tipe input tidak valid!");
    }

    const uploadResponse = await axios.post(
      "https://photoaid.com/en/tools/api/tools/upload",
      { base64: base64Image, token, reqURL: endpoints[type].upload },
      {
        headers: {
          ...headers,
          referer: endpoints[type].referer,
          "content-type": "text/plain;charset=UTF-8",
          cookie: `uuidtoken2=${token}`,
        },
      },
    );

    let final_result;
    do {
      final_result = await axios.post(
        "https://photoaid.com/en/tools/api/tools/result",
        {
          request_id: uploadResponse.data.request_id,
          reqURL: endpoints[type].result,
        },
        {
          headers: {
            ...headers,
            referer: endpoints[type].referer,
            "content-type": "text/plain;charset=UTF-8",
            cookie: `uuidtoken2=${token}`,
          },
        },
      );

      if (final_result.data.statusAPI === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } while (final_result.data.statusAPI === "processing");

    return final_result.data;
  } catch (error) {
    throw error;
  }
}

module.exports = photoaid;
