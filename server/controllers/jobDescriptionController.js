const axios = require('axios');
const cheerio = require('cheerio');

// Basic URL validation (you might want a more robust library later)
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const fetchJobDescription = async (req, res) => {
  const { jobUrl } = req.body;

  if (!jobUrl) {
    return res.status(400).json({ message: 'Job URL is required.' });
  }

  if (!isValidUrl(jobUrl)) {
    return res.status(400).json({ message: 'Invalid Job URL format provided.' });
  }

  console.log(`Fetching job description from: ${jobUrl}`);

  try {
    // Fetch HTML content from the URL
    const response = await axios.get(jobUrl, {
      headers: {
        // Mimic a browser user agent to avoid simple blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Set a timeout for the request (e.g., 10 seconds)
      timeout: 10000, 
    });

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // --- Basic Content Extraction Strategy ---
    // This is a very simplified approach. Real-world extraction is much harder.
    // Try common selectors for main content or job descriptions.
    let mainContent = 
      $('article').text() || 
      $('[role="main"]').text() || 
      $('#job-description').text() || 
      $('.job-description').text() || 
      $('main').text() ||
      $('body').text(); // Fallback to the whole body

    // Basic cleanup: remove excessive whitespace
    const extractedText = mainContent.replace(/\s\s+/g, ' ').trim();

    if (!extractedText) {
      console.warn(`Could not extract meaningful content from ${jobUrl}`);
      return res.status(400).json({ message: 'Could not extract job description content from the provided URL. The website structure might be unsupported.' });
    }
    
    console.log(`Successfully extracted content from ${jobUrl}. Length: ${extractedText.length}`);

    res.status(200).json({ 
      message: 'Job description fetched successfully.', 
      jobUrl: jobUrl,
      // Return first 1000 chars for preview
      extractedDescriptionSnippet: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''),
      extractedDescription: extractedText // Send the full text as well
    });

  } catch (error) {
    console.error(`Error fetching or parsing URL ${jobUrl}:`, error.message);
    let errorMessage = 'Failed to fetch or parse the Job URL.';
    let statusCode = 500;

    if (error.response) {
      // Request made and server responded with a status code outside 2xx range
      errorMessage = `Error fetching URL: Server responded with status ${error.response.status}.`;
      statusCode = error.response.status >= 400 && error.response.status < 500 ? 400 : 500; // Treat client errors as 400
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = 'Error fetching URL: No response received from the server.';
      statusCode = 504; // Gateway Timeout
    } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Error fetching URL: The request timed out.';
        statusCode = 504; // Gateway Timeout
    } else {
      // Something happened in setting up the request
      errorMessage = `Error fetching URL: ${error.message}`;
    }
    res.status(statusCode).json({ message: errorMessage });
  }
};

module.exports = {
  fetchJobDescription,
};
