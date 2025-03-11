const axios = require("axios");
const cheerio = require("cheerio");

class Playstore {
  search = async function search(query) {
    try {
      const url = `https://store.playstation.com/en-id/search/${encodeURIComponent(query)}`;

      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      const results = [];

      $(".psw-product-tile").each((index, element) => {
        const title = $(element).find(".psw-t-body").text().trim();
        const link = $(element).closest("a").attr("href");
        const thumbnailUrl = $(element).find("img").attr("src");

        // Konversi ke URL gambar HD dengan resolusi 840
        const images = thumbnailUrl
          ? thumbnailUrl.split("?")[0].replace("thumb=true", "") + "?w=840"
          : null;

        results.push({
          title,
          link: `https://store.playstation.com${link}`,
          images,
        });
      });

      return results;
    } catch (error) {
      console.error("Error scraping:", error);
      return [];
    }
  };

  detail = async function detail(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      const $ = cheerio.load(response.data);
      const scriptContent = $("#mfe-jsonld-tags").html();
      const jsonData = JSON.parse(scriptContent);
      const envScriptContent = $('script[id^="env:"]').first().html();
      const envData = JSON.parse(envScriptContent);

      const screenshotImages = [];
      let coverImage = null;

      if (envData.cache) {
        const product = envData.cache[`Product:${jsonData.sku}`];
        if (product && product.media) {
          product.media.forEach((media) => {
            if (media.type === "IMAGE") {
              if (media.role === "SCREENSHOT") {
                screenshotImages.push({
                  type: "screenshot",
                  url: media.url,
                });
              } else if (media.role === "GAMEHUB_COVER_ART") {
                coverImage = {
                  type: "cover",
                  url: media.url,
                };
              }
            }
          });
        }
      }

      const genres = [];
      $('span[data-qa^="mfe-game-title#productTag"]').each((i, elem) => {
        const tag = $(elem).text().trim();
        if (!tag.includes("PS")) {
          genres.push(tag);
        }
      });

      return {
        name: jsonData.name,
        description: jsonData.description,
        sku: jsonData.sku,
        genres: genres,
        price: {
          currency: jsonData.offers.priceCurrency,
          value: jsonData.offers.price,
        },
        cover: coverImage,
        screenshots: screenshotImages,
      };
    } catch (error) {
      return null;
    }
  };
}
module.exports = new Playstore();
