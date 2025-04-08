// server/services/downloadService.js
const puppeteer = require('puppeteer');
const HTMLtoDOCX = require('html-to-docx');
const TurndownService = require('turndown');
const fs = require('fs').promises; // For temporary file operations
const path = require('path'); // For path operations
const os = require('os'); // For temp directory

// --- PDF Conversion ---
async function convertHtmlToPdf(htmlContent) {
    let browser = null;
    let tempFilePath = null;
    
    try {
        console.log("Starting PDF conversion process...");
        
        // Create a simplified HTML document with inline styles
        const styles = `
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            h1 { text-align: center; margin-bottom: 20px; font-size: 24px; }
            h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            h3 { font-size: 16px; margin-top: 15px; margin-bottom: 5px; }
            p { margin: 8px 0; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .section { margin-bottom: 20px; }
        `;
        
        // Create a complete HTML document
        const completeHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Resume</title>
                <style>${styles}</style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
        
        // Write to a temporary file (sometimes helps with rendering issues)
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `resume-${Date.now()}.html`);
        await fs.writeFile(tempFilePath, completeHtml);
        console.log(`Wrote HTML to temporary file: ${tempFilePath}`);
        
        // Launch browser with minimal options
        console.log("Launching headless browser...");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        // Create a new page
        const page = await browser.newPage();
        console.log("Browser page created");
        
        // Navigate to the temp file instead of using setContent
        await page.goto(`file://${tempFilePath}`, {
            waitUntil: 'networkidle0',
            timeout: 30000 // 30 second timeout
        });
        console.log("Page loaded from temp file");
        
        // Set viewport size
        await page.setViewport({
            width: 816, // Letter width in pixels (8.5" at 96dpi)
            height: 1056, // Letter height (11" at 96dpi)
            deviceScaleFactor: 1
        });
        
        // Try to save the PDF to a temporary file first
        const tempPdfPath = path.join(tempDir, `resume-${Date.now()}.pdf`);
        await page.pdf({
            path: tempPdfPath,
            format: 'Letter',
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            },
            printBackground: true
        });
        
        console.log(`PDF saved to temporary file: ${tempPdfPath}`);
        
        // Read the PDF file into a buffer
        const pdfBuffer = await fs.readFile(tempPdfPath);
        console.log(`PDF read into buffer. Size: ${pdfBuffer.length} bytes`);
        
        // Clean up the temporary PDF file
        await fs.unlink(tempPdfPath);
        console.log(`Removed temporary PDF file: ${tempPdfPath}`);
        
        if (pdfBuffer.length === 0) {
            throw new Error("Generated PDF buffer is empty");
        }
        
        return pdfBuffer;
    } catch (error) {
        console.error("Error in PDF conversion:", error);
        throw new Error(`PDF conversion failed: ${error.message}`);
    } finally {
        // Clean up resources
        if (browser) {
            try {
                await browser.close();
                console.log("Browser closed");
            } catch (err) {
                console.error("Error closing browser:", err);
            }
        }
        
        // Remove temporary file if it was created
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
                console.log(`Removed temporary file: ${tempFilePath}`);
            } catch (err) {
                console.error("Error removing temporary file:", err);
            }
        }
    }
}

// --- DOCX Conversion ---
async function convertHtmlToDocx(htmlContent) {
    try {
        console.log("Converting HTML to DOCX...");
        // Add basic styling or use inline styles from HTML
        const fileBuffer = await HTMLtoDOCX(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: false, // Adjust as needed
            header: false, // Adjust as needed
        });
        console.log("DOCX conversion successful.");
        return fileBuffer;
    } catch (error) {
        console.error("Error converting HTML to DOCX:", error);
        throw new Error(`DOCX conversion failed: ${error.message}`);
    }
}

// --- Markdown Conversion ---
async function convertHtmlToMarkdown(htmlContent) {
    try {
        console.log("Converting HTML to Markdown...");
        
        // Forcefully remove style blocks using regex before Turndown
        const cleanHtml = htmlContent.replace(/<style[^>]*>.*?<\/style>/gs, '');

        const turndownService = new TurndownService({
            headingStyle: 'atx', // Use '#' for headers
            codeBlockStyle: 'fenced', // Use ``` for code blocks
            emDelimiter: '_', // Use underscores for emphasis
            // ignore: ['style', 'script'] // Keep this commented or remove if adding explicit rule
        });

        // Explicitly remove style and script elements
        turndownService.remove(['style', 'script']);

        // Handle potential complexities like tables if needed
        // turndownService.use(require('turndown-plugin-gfm').gfm); // Example for GFM tables

        const markdownContent = turndownService.turndown(cleanHtml);
        console.log("Markdown conversion successful.");
        return Buffer.from(markdownContent, 'utf8'); // Return as buffer
    } catch (error) {
        console.error("Error converting HTML to Markdown:", error);
        throw new Error(`Markdown conversion failed: ${error.message}`);
    }
}

module.exports = {
    convertHtmlToPdf,
    convertHtmlToDocx,
    convertHtmlToMarkdown,
};
