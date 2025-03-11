const axios = require("axios");
const FormData = require("form-data");

async function vocalRemover(audioBuffer) {
  const api = axios.create({
    baseURL: "https://aivocalremover.com",
  });

  const getKey = async () => (await api.get("/")).data.match(/key:"(\w+)/)[1];

  const form = new FormData();
  const fileName = Math.random().toString(36) + ".mpeg";
  form.append("fileName", audioBuffer, fileName);

  const [key, fileUpload] = await Promise.all([
    getKey(),
    api
      .post("/api/v2/FileUpload", form, {
        headers: form.getHeaders(),
      })
      .catch((e) => e.response),
  ]);

  if (fileUpload.status !== 200) throw fileUpload.data || fileUpload.statusText;

  const processFile = await api
    .post(
      "/api/v2/ProcessFile",
      new URLSearchParams({
        file_name: fileUpload.data.file_name,
        action: "watermark_video",
        key,
        web: "web",
      }),
    )
    .catch((e) => e.response);

  return processFile.data;
}

module.exports = vocalRemover;
