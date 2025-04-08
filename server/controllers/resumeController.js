// server/controllers/resumeController.js
const llmService = require('../services/llmService');
const templateService = require('../services/templateService'); // Import the template service
const downloadService = require('../services/downloadService'); // Import the download service

exports.generateResume = async (req, res) => {
    try {
        // Destructure expected data from the request body
        const { resumeInput, jobDescription, templateId, userInstructions } = req.body;

        // --- Input Validation --- 
        if (!resumeInput || !resumeInput.data) {
            return res.status(400).json({ message: 'Missing resume input data.' });
        }
        if (!jobDescription || !jobDescription.text) { // Assuming jobDescription has at least a text field
            return res.status(400).json({ message: 'Missing job description text.' });
        }

        // Use 'default.ejs' if no templateId is provided
        const selectedTemplate = templateId ? `${templateId}.ejs` : 'default.ejs';

        console.log("Received request to generate resume:", 
            {
                resumeSource: resumeInput.source,
                jobDescLength: jobDescription.text.length,
                template: selectedTemplate,
                instructions: userInstructions
            }
        );

        // --- Call LLM Service --- 
        const generatedContent = await llmService.generateResumeContent(
            resumeInput.data, 
            jobDescription,   
            userInstructions  
        );

        // --- Format Output using Template Service --- 
        const templateData = { 
            generatedSections: generatedContent, 
            // Add any other data needed by the template here 
            // E.g., candidateName: resumeInput.data.name 
        };

        // Render the HTML using the selected template
        const renderedHtml = await templateService.renderTemplate(selectedTemplate, templateData);

        console.log("Resume generation and templating successful.");
        // Decide response format: send HTML or structured JSON? 
        // Sending HTML directly for now, could also send JSON with HTML embedded
        res.setHeader('Content-Type', 'text/html'); // Set content type for HTML response
        res.status(200).send(renderedHtml);

        // Alternatively, send JSON with HTML:
        // res.status(200).json({
        //     message: "Resume generated successfully",
        //     renderedHtml: renderedHtml,
        //     templateUsed: selectedTemplate
        // });

    } catch (error) {
        console.error('Error in generateResume controller:', error);
        // Determine status code based on error type if possible
        const statusCode = error.message.includes('Template') ? 404 : 500;
        res.status(statusCode).json({ 
            message: 'Failed to generate resume.', 
            error: error.message, 
        });
    }
};

// Controller function for chat and rebuild actions
exports.handleChat = async (req, res) => {
    try {
        const { 
            type, // 'chat' or 'rebuild'
            chatHistory, 
            currentMessage, 
            originalResumeData, 
            jobDescriptionData 
        } = req.body;

        // --- Input Validation --- 
        if (!type || !['chat', 'rebuild'].includes(type)) {
            return res.status(400).json({ message: 'Invalid request type.' });
        }
        if (!chatHistory || !Array.isArray(chatHistory)) {
             return res.status(400).json({ message: 'Missing or invalid chat history.' });
        }
        if (type === 'chat' && typeof currentMessage !== 'string') {
            return res.status(400).json({ message: 'Missing current message for chat request.' });
        }
         if (!originalResumeData || !jobDescriptionData) {
             return res.status(400).json({ message: 'Missing original resume or job description data for context.' });
        }

        console.log(`Handling request type: ${type}`);

        if (type === 'chat') {
            // --- Handle Simple Chat Query ---
            const aiResponse = await llmService.handleResumeChat(
                chatHistory, 
                currentMessage, 
                originalResumeData, 
                jobDescriptionData
            );
            res.status(200).json({ response: aiResponse });

        } else if (type === 'rebuild') {
            // --- Handle Rebuild Request ---
            
            // Combine chat history into user instructions for regeneration
            const rebuildInstructions = chatHistory
                .filter(msg => msg.sender === 'user') // Only consider user messages as instructions
                .map(msg => msg.text)
                .join('\nFeedback: '); // Join user feedback
            
            console.log('Rebuilding resume with instructions:', rebuildInstructions);

            // Call the original generation function with combined instructions
            const regeneratedContent = await llmService.generateResumeContent(
                originalResumeData, // Use the original extracted/input data
                jobDescriptionData,
                `Based on the previous resume attempt, apply the following user feedback:\nFeedback: ${rebuildInstructions}`
            );

            // Re-render the template with the new content
            const templateData = { generatedSections: regeneratedContent };
            const selectedTemplate = 'default.ejs'; // Assuming default template for now
            const renderedHtml = await templateService.renderTemplate(selectedTemplate, templateData);
            
            console.log("Resume rebuild and templating successful.");
            res.status(200).json({ 
                message: "Resume rebuilt successfully based on feedback.",
                updatedHtml: renderedHtml
            });
        }

    } catch (error) {
        console.error('Error in handleChat controller:', error);
        res.status(500).json({ 
            message: `Failed to handle ${req.body.type || 'chat'} request.`, 
            error: error.message, 
        });
    }
};

// Controller function to handle resume download requests
exports.downloadResume = async (req, res) => {
    try {
        const { htmlContent, format } = req.body; // format: 'pdf', 'docx', 'md'

        // --- Input Validation ---
        if (!htmlContent) {
            return res.status(400).json({ message: 'Missing HTML content for download.' });
        }
        if (!format || !['pdf', 'docx', 'md'].includes(format)) {
            return res.status(400).json({ message: 'Invalid or missing download format.' });
        }

        console.log(`Handling download request for format: ${format}`);

        let fileBuffer;
        let contentType;
        let fileName = `resume.${format}`;

        switch (format) {
            case 'pdf':
                fileBuffer = await downloadService.convertHtmlToPdf(htmlContent);
                contentType = 'application/pdf';
                break;
            case 'docx':
                fileBuffer = await downloadService.convertHtmlToDocx(htmlContent);
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                fileName = 'resume.docx'; // Ensure correct extension
                break;
            case 'md':
                fileBuffer = await downloadService.convertHtmlToMarkdown(htmlContent);
                contentType = 'text/markdown';
                break;
            default:
                // Should not happen due to validation, but good practice
                return res.status(400).json({ message: 'Unsupported format.' }); 
        }

        console.log(`Sending ${format} file to client.`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', contentType);
        res.send(fileBuffer);

    } catch (error) {
        console.error(`Error in downloadResume controller (format: ${req.body.format}):`, error);
        res.status(500).json({ 
            message: `Failed to download resume as ${req.body.format || 'file'}.`, 
            error: error.message, 
        });
    }
};
