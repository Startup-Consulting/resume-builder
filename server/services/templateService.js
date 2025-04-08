// server/services/templateService.js
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file reading

// Define the path to the templates directory
const templatesDir = path.join(__dirname, '..', 'templates');

/**
 * Renders resume data using a specified EJS template.
 *
 * @param {string} templateName - The name of the template file (e.g., 'default.ejs').
 * @param {object} data - The data object to pass to the template (should match EJS variables).
 * @returns {Promise<string>} - A promise that resolves with the rendered HTML string.
 * @throws {Error} - Throws an error if the template file doesn't exist or rendering fails.
 */
async function renderTemplate(templateName, data) {
    const templatePath = path.join(templatesDir, templateName);

    try {
        // Check if template file exists
        await fs.access(templatePath);
    } catch (error) {
        console.error(`Template file not found: ${templatePath}`);
        throw new Error(`Template '${templateName}' not found.`);
    }

    try {
        // Render the template with the provided data
        // Using await here because ejs.renderFile is typically async when reading files
        const renderedHtml = await ejs.renderFile(templatePath, data);
        return renderedHtml;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        throw new Error(`Failed to render resume template: ${error.message}`);
    }
}

module.exports = {
    renderTemplate,
};
