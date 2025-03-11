const axios = require("axios");
const cheerio = require("cheerio");

/*
 * This Scrape Make By Zivly Canzy
 * @zivly_san
 */

async function furaffinity(query, maxResults = 10) {
  async function fetchDetails(link) {
    try {
      const response = await axios.get(link);
      const html = response.data;
      const $ = cheerio.load(html);
      const description = $(".submission-description").text().trim();
      const image = $("#submissionImg").attr("data-fullview-src");
      return {
        description: description || null,
        image: image ? `https:${image}` : null,
      };
    } catch (error) {
      return {
        status: "404",
        massage: "Not Found",
      };
    }
  }
  let page = 1;
  let results = [];
  let hasNextPage = true;
  const baseUrl = `https://www.furaffinity.net/search/?q=${encodeURIComponent(query)}`;
  while (hasNextPage && results.length < maxResults) {
    try {
      const url = `${baseUrl}&page=${page}`;
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      $("figure").each((index, element) => {
        const title = $(element).find("p a").attr("title");
        const titleLink = $(element).find("p a").attr("href");
        const username = $(element).find("a[title]").last().attr("title");
        results.push({
          title: title || null,
          link: titleLink ? `https://www.furaffinity.net${titleLink}` : null,
          username: username || null,
        });
      });
      hasNextPage = $('button[name="next_page"]').length > 0;
      page++;
    } catch (error) {
      hasNextPage = false;
    }
  }
  if (results.length > maxResults) {
    results = results.sort(() => 0.5 - Math.random()).slice(0, maxResults);
  }
  for (let result of results) {
    const details = await fetchDetails(result.link);
    result.description = details.description;
    result.image = details.image;
  }
  return results;
}

module.exports = furaffinity;
