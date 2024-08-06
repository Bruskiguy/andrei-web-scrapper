const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const websites = [
  "https://sematext.com",
  // Add more websites to this array
];

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0.3 Safari/602.3.12",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
];

const results = [];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeWebsite(url) {
  const randomUserAgent =
    userAgents[Math.floor(Math.random() * userAgents.length)];
  const headers = {
    "User-Agent": randomUserAgent,
  };

  try {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);

    let foundYouTubeChannel = false;
    let youtubeChannel = "";

    $("a").each((i, link) => {
      const href = $(link).attr("href");
      if (href && href.includes("youtube.com")) {
        youtubeChannel = href;
        foundYouTubeChannel = true;
      }
    });

    results.push({
      website: url,
      foundYouTubeChannel,
      youtubeChannel,
    });

    if (foundYouTubeChannel) {
      console.log(`YouTube Channel found on ${url}: ${youtubeChannel}`);
    } else {
      console.log(`No YouTube Channel found on ${url}`);
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
  }
}

(async () => {
  for (const website of websites) {
    await scrapeWebsite(website);
    await delay(700); // Add a delay of 0.7 seconds between each request
  }

  fs.writeFileSync("returned.json", JSON.stringify(results, null, 2));
})();
