import { JSDOM } from 'jsdom';
import { URL } from 'url'; // To resolve relative URLs

export default async function handler(req, res) {
  const { url } = req.query;

  // Check if the URL is provided
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  // Ensure the URL is complete (adding https:// if missing)
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    // Fetch the HTML content of the page using Next.js's built-in fetch
    const response = await fetch(fullUrl);

    // If the request is not successful, return an error
    if (!response.ok) {
      return res.status(500).json({ error: `Failed to fetch ${url}` });
    }

    const html = await response.text();

    // Parse the HTML using jsdom
    const { document } = new JSDOM(html).window;

    // Find all stylesheets (link tags with rel="stylesheet")
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    let fonts = new Set();

    // Loop through each stylesheet and fetch its content to parse for font-family rules
    for (const stylesheet of stylesheets) {
      const cssUrl = stylesheet.href;

      // Resolve relative URLs for CSS files
      const resolvedUrl = new URL(cssUrl, fullUrl).href;

      try {
        const cssResponse = await fetch(resolvedUrl);
        const cssText = await cssResponse.text();

        // Log CSS content for debugging
        console.log(`CSS content from ${resolvedUrl}:`, cssText);

        // Look for font-family in the CSS content and extract font names
        const fontRegex = /font-family:\s*([^\);]+(?:\s*,\s*[^\);]+)*)/g;
        let match;
        while ((match = fontRegex.exec(cssText)) !== null) {
          // Clean up font names (remove quotes, extra characters)
          const fontList = match[1]
            .split(',')
            .map(font => font.trim().replace(/["']/g, '').toLowerCase())
            .filter(font => font.length > 0); // remove empty entries
          
          fontList.forEach(font => fonts.add(font));
        }
      } catch (cssError) {
        console.error(`Error fetching CSS from ${resolvedUrl}:`, cssError.message);
      }
    }

    // Check inline <style> tags for fonts
    const inlineStyles = Array.from(document.querySelectorAll('style'));
    inlineStyles.forEach((styleTag) => {
      const cssText = styleTag.textContent;

      // Log inline CSS content for debugging
      console.log('Inline CSS:', cssText);

      // Look for font-family in the inline CSS and extract font names
      const fontRegex = /font-family:\s*([^\);]+(?:\s*,\s*[^\);]+)*)/g;
      let match;
      while ((match = fontRegex.exec(cssText)) !== null) {
        const fontList = match[1]
          .split(',')
          .map(font => font.trim().replace(/["']/g, '').toLowerCase())
          .filter(font => font.length > 0);
        
        fontList.forEach(font => fonts.add(font));
      }
    });

    // Convert the Set to an array and remove invalid or irrelevant entries (like CSS rules)
    const fontArray = Array.from(fonts).filter(font => {
      // Exclude entries that contain CSS rules or extraneous content
      return !/[^a-zA-Z0-9\s-]/.test(font) && font.length > 1; // Exclude fonts that look like CSS rules
    });

    // Remove duplicates by ensuring uniqueness
    const uniqueFonts = [...new Set(fontArray)];

    // Return the cleaned fonts found
    return res.status(200).json({ fonts: uniqueFonts });
  } catch (error) {
    console.error('Error fetching fonts:', error.message);
    return res.status(500).json({ error: `Error fetching fonts: ${error.message}` });
  }
}
