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

    // Validate the data structure before rendering
    if (!data || typeof data !== 'object') {
        console.error('Invalid data provided to template service:', data);
        throw new Error('Invalid data structure provided for template rendering.');
    }

    // Check for required generatedSections
    if (!data.generatedSections) {
        console.error('Missing generatedSections in template data:', data);
        throw new Error('Template data is missing required generatedSections object.');
    }

    // Log the template data structure for debugging
    console.log('Template data structure:', {
        hasContactInfo: !!data.generatedSections.contactInfo,
        hasSummary: !!data.generatedSections.summaryOrObjective,
        experienceCount: Array.isArray(data.generatedSections.experience) ? data.generatedSections.experience.length : 'not an array',
        skillsPresent: !!data.generatedSections.skills,
        educationCount: Array.isArray(data.generatedSections.education) ? data.generatedSections.education.length : 'not an array'
    });

    try {
        // Render the template with the provided data
        // Using await here because ejs.renderFile is typically async when reading files
        const renderedHtml = await ejs.renderFile(templatePath, data);
        console.log('Template rendered successfully. HTML length:', renderedHtml.length);
        return renderedHtml;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        // Provide more context about the error
        if (error.message.includes('generatedSections')) {
            console.error('This appears to be an issue with the generatedSections data structure.');
        }
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
        throw new Error(`Failed to render resume template: ${error.message}`);
    }
}

module.exports = {
    renderTemplate,
};
