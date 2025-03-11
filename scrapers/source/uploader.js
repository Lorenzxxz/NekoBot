const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fileType = require("file-type");

async function UploadFile(media) {
  try {
    let mime = await fileType.fromBuffer(media);
    let form = new FormData();

    form.append("files[]", media, `file-${Date.now()}.${mime.ext}`);

    let { data } = await axios.post("https://pomf.lain.la/upload.php", form, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        ...form.getHeaders(),
      },
    });

    return data.files[0].url;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function uploadToCatbox(media) {
  try {
    let mime = await fileType.fromBuffer(media);
    let form = new FormData();

    form.append("fileToUpload", media, `file-${Date.now()}.${mime.ext}`);
    form.append("reqtype", "fileupload");

    const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return data.trim();
  } catch (error) {
    throw new Error(`Failed to upload to Catbox: ${error.message}`);
  }
}

module.exports = { UploadFile, uploadToCatbox };
