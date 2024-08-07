const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config(); // Load environment variables

const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.CUSTOM_SEARCH_ENGINE_ID;

// Function to get the URL for a company from Google Custom Search JSON API
async function getCompanyURL(company) {
  const query = encodeURIComponent(company);
  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(searchUrl);
    const firstResult = response.data.items ? response.data.items[0] : null;
    if (firstResult) {
      console.log(`URL for ${company}: ${firstResult.link}`);
    } else {
      console.log(`No results found for ${company}`);
    }
    return firstResult ? firstResult.link : null;
  } catch (error) {
    console.error(
      "Error fetching search results:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

// Function to scrape a website to find YouTube channels
async function scrapeWebsite(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let youtubeChannel = "";

    // Check all anchor tags and button tags for YouTube URLs
    $("a, button").each((i, element) => {
      let href = $(element).attr("href");
      if (!href) {
        href = $(element).attr("data-href");
      }
      if (
        href &&
        href.includes("youtube.com") &&
        (href.includes("/channel/") ||
          href.includes("/c/") ||
          href.includes("/user"))
      ) {
        youtubeChannel = href;
        return false;
      }
    });

    return {
      website: url,
      youtubeChannel: youtubeChannel,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return {
      website: url,
      youtubeChannel: "",
    };
  }
}

// Main function to process a list of companies
async function processCompanies(companies) {
  const results = [];

  for (const company of companies) {
    const url = await getCompanyURL(company);
    if (url) {
      const scrapeResult = await scrapeWebsite(url);
      results.push({
        name: company,
        businessSiteURL: url,
        youtubeChannel: scrapeResult.youtubeChannel || null,
      });
    } else {
      results.push({
        name: company,
        businessSiteURL: null,
        youtubeChannel: null,
      });
    }
  }

  // Write the results to a JSON file
  fs.writeFileSync("returned.json", JSON.stringify(results, null, 2));
  console.log("Results written to returned.json");
}

// Example usage
const companies = ["sematext", "datadog", "canva"]; // Example list of companies
processCompanies(companies);
