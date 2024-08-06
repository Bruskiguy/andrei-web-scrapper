const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.cx;

// Get the URL for a company from Google Custom Search JSON API
async function getCompanyURL(company) {
  const query = encodeURIComponent(company);
  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;

  try {
    const response = await axios.get(searchUrl);
    const firstResult = response.data.items[0];
    return firstResult ? firstResult.link : null;
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    return null;
  }
}

// Main execution function
(async () => {
  const companies = ["sematext", "apple", "microsoft", "IBM", "tesla"];
  const companyURLs = await Promise.all(companies.map(getCompanyURL));

  // Filter out null or invalid URLs
  const validURLs = companyURLs.filter((url) => url !== null);
  console.log("Valid Company URLs:", validURLs);

  if (validURLs.length === 0) {
    console.log("No valid URLs found. Check the Google search extraction.");
  }

  // Further processing can be done here
})();
