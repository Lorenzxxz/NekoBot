const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const FormData = require("form-data");

const swapface = {
  create: async (target, source) => {
    let targetImg, sourceImg;
    const request = async (image, prefix) => {
      if (typeof image === "string" && image.startsWith("http")) {
        const response = await axios.get(image, {
          responseType: "arraybuffer",
        });
        return await sb2f(response.data, `${prefix}.jpg`);
      } else if (Buffer.isBuffer(image)) {
        return await sb2f(image, `${prefix}.jpg`);
      } else {
        return image;
      }
    };

    targetImg = await request(target, "target");
    sourceImg = await request(source, "source");
    const formData = new FormData();
    formData.append("target_image_file", fs.createReadStream(targetImg));
    formData.append("target_face_file", fs.createReadStream(sourceImg));

    const config = {
      headers: {
        authority: "aifaceswapper.io",
        accept: "*/*",
        "content-type":
          "multipart/form-data; boundary=" + formData.getBoundary(),
        origin: "https://aifaceswapper.io",
        referer: "https://aifaceswapper.io/id",
        authorization: token(),
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    try {
      const response = await axios.post(
        "https://aifaceswapper.io/api/nicefish/fs/singleface",
        formData,
        config,
      );
      const requestId = response.data.data.request_id;
      let result;
      let status = "waiting";
      let retries = 0;

      while (status === "waiting" && retries < 20) {
        const resultx = await axios.get(
          `https://aifaceswapper.io/api/nicefish/fs/result?request_id=${requestId}`,
          config,
        );
        status = resultx.data.data.status;

        if (status === "waiting") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retries++;
        } else {
          result = resultx.data;
        }
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      if (fs.existsSync(targetImg)) fs.unlinkSync(targetImg);
      if (fs.existsSync(sourceImg)) fs.unlinkSync(sourceImg);
    }
  },
};

async function sb2f(buffer, filename) {
  const tmpFile = `./tmp/${crypto.randomBytes(8).toString("hex")}_${filename}`;
  await fs.promises.mkdir("./tmp", { recursive: true });
  return new Promise((resolve, reject) => {
    fs.writeFile(tmpFile, buffer, (err) => {
      if (err) reject(err);
      else resolve(tmpFile);
    });
  });
}

function token() {
  const ts = Date.now().toString(16).slice(0, 8);
  const pea =
    [1, 2, 3].map(() => Math.random().toString(16).slice(2, 6)).join("-") +
    Math.random().toString(16).slice(2, 5);
  return `${ts}-${pea}`;
}

module.exports = swapface;
