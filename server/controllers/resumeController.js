// server/controllers/resumeController.js
const llmService = require('../services/llmService');
const templateService = require('../services/templateService'); // Import the template service
const downloadService = require('../services/downloadService'); // Import the download service

exports.generateResume = async (req, res) => {
    try {
        // Destructure expected data from the request body
        const { resumeInput, jobDescription, templateId, userInstructions } = req.body;

        console.log("Generate Resume Request:", {
            resumeInputType: typeof resumeInput,
            resumeInputKeys: resumeInput ? Object.keys(resumeInput) : 'null',
            jobDescriptionType: typeof jobDescription,
            jobDescriptionKeys: jobDescription ? Object.keys(jobDescription) : 'null',
            templateId,
            userInstructionsPresent: !!userInstructions
        });

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

        // Ensure resumeInput.data is properly formatted for the LLM service
        let formattedResumeData = resumeInput.data;
        
        // If resumeInput.data only contains extractedText, create a more structured format
        if (resumeInput.data.extractedText && Object.keys(resumeInput.data).length === 1) {
            console.log("Converting simple extractedText to structured format for LLM...");
            formattedResumeData = {
                rawText: resumeInput.data.extractedText,
                // Add basic structure that LLM can work with
                name: "Extracted from resume",
                contact: {
                    email: "Extracted from resume",
                    phone: "Extracted from resume"
                },
                // These empty arrays/objects ensure the LLM has the expected structure
                experience: [],
                education: [],
                skills: []
            };
        }

        // --- Call LLM Service --- 
        const generatedContent = await llmService.generateResumeContent(
            formattedResumeData, 
            jobDescription,   
            userInstructions  
        );

        console.log("--- Generated Content from LLM (Before Normalization) ---\n", JSON.stringify(generatedContent, null, 2), "\n---");

        // --- Format Output using Template Service --- 
        // Normalize the generated content to ensure all expected keys exist for the template
        const normalizedContent = {
            contactInfo: generatedContent.contactInfo || { name: '', phone: '', email: '', linkedin: '', portfolio: '', location: '' },
            summaryOrObjective: generatedContent.summaryOrObjective || '',
            experience: generatedContent.experience || [],
            skills: generatedContent.skills || { technical: [], soft: [], other: [] },
            education: generatedContent.education || [],
            certifications: generatedContent.certifications || [],
            projects: generatedContent.projects || [],
            awards: generatedContent.awards || [],
            volunteerWork: generatedContent.volunteerWork || [],
            professionalAffiliations: generatedContent.professionalAffiliations || [],
            // Add any other sections the default.ejs template might expect
            languages: generatedContent.languages || [],
            interests: generatedContent.interests || [] 
        };

        console.log("--- Normalized Content (For Template) ---\n", JSON.stringify(normalizedContent, null, 2), "\n---");

        // Ensure skills is properly formatted as an object with arrays
        if (normalizedContent.skills && !normalizedContent.skills.technical && !normalizedContent.skills.soft) {
            // If skills is a flat array, convert it to the expected structure
            if (Array.isArray(normalizedContent.skills)) {
                console.log("Converting skills array to structured format...");
                normalizedContent.skills = {
                    technical: normalizedContent.skills,
                    soft: [],
                    other: []
                };
            }
            // If skills is an object but missing the expected properties
            else if (typeof normalizedContent.skills === 'object') {
                console.log("Ensuring skills object has required properties...");
                normalizedContent.skills.technical = normalizedContent.skills.technical || [];
                normalizedContent.skills.soft = normalizedContent.skills.soft || [];
                normalizedContent.skills.other = normalizedContent.skills.other || [];
            }
        }

        const templateData = { 
            generatedSections: normalizedContent, 
            // Add any other data needed by the template here 
            // E.g., candidateName: resumeInput.data.name 
        };

        console.log("Sending data to template service with structure:", {
            hasGeneratedSections: !!templateData.generatedSections,
            contactInfoPresent: !!templateData.generatedSections.contactInfo,
            experienceLength: templateData.generatedSections.experience.length,
            skillsStructure: typeof templateData.generatedSections.skills
        });

        // Render the HTML using the selected template
        const renderedHtml = await templateService.renderTemplate(selectedTemplate, templateData);

        console.log("Resume generation and templating successful.");
        // Decide response format: send HTML or structured JSON? 
        // Sending HTML directly for now, could also send JSON with HTML embedded
        // Send JSON response with HTML and structured data
        res.status(200).json({
            message: "Resume generated successfully",
            renderedHtml: renderedHtml,
            templateUsed: selectedTemplate,
            resumeData: normalizedContent // Include the structured data for potential editing
        });

    } catch (error) {
        console.error('Error in generateResume controller:', error);
        res.status(500).json({ 
            message: 'Failed to generate resume.', 
            error: error.message, 
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const { htmlContent, format, applicantName, jobPosition } = req.body; // format: 'pdf', 'docx', 'md'

        // --- Input Validation ---
        if (!htmlContent) {
            return res.status(400).json({ message: 'Missing HTML content for download.' });
        }
        if (!format || !['pdf', 'docx', 'md'].includes(format)) {
            return res.status(400).json({ message: 'Invalid or missing download format.' });
        }

        console.log(`Handling download request for format: ${format}`);

        // Create filename with applicant name and job position
        const sanitizedName = (applicantName || 'Resume').replace(/\s+/g, '_');
        const sanitizedPosition = (jobPosition || '').replace(/\s+/g, '_');
        
        let fileName = sanitizedName;
        if (sanitizedPosition) {
            fileName += `-${sanitizedPosition}`;
        }
        fileName += `.${format}`;
        
        // Ensure correct extension for docx
        if (format === 'docx') {
            fileName = fileName.replace(/\.docx$|\.md$|\.pdf$/, '.docx');
        }
        
        // Remove any trailing underscores before the extension
        fileName = fileName.replace(/_\.(pdf|docx|md)$/, '.$1');
        
        let fileBuffer;
        let contentType;

        switch (format) {
            case 'pdf':
                fileBuffer = await downloadService.convertHtmlToPdf(htmlContent);
                contentType = 'application/pdf';
                break;
            case 'docx':
                fileBuffer = await downloadService.convertHtmlToDocx(htmlContent);
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case 'md':
                fileBuffer = await downloadService.convertHtmlToMarkdown(htmlContent);
                contentType = 'text/markdown';
                break;
            default:
                // Should not happen due to validation, but good practice
                return res.status(400).json({ message: 'Unsupported format.' }); 
        }

        console.log(`Sending ${format} file to client with filename: ${fileName}`);
        // Use RFC 5987 encoding for the filename to handle special characters properly
        // Remove any characters that aren't allowed in HTTP headers
        const safeFileName = fileName.replace(/[^\x20-\x7E]/g, '_');
        const encodedFilename = encodeURIComponent(fileName).replace(/['()]/g, escape);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFilename}`);
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

// Controller function to parse HTML content into structured resume data
exports.parseResumeHtml = async (req, res) => {
    try {
        const { htmlContent } = req.body;

        // --- Input Validation ---
        if (!htmlContent) {
            return res.status(400).json({ message: 'Missing HTML content to parse.' });
        }

        console.log("Parsing HTML content to extract resume data...");

        // Use a service to extract structured data from HTML
        // This is a simplified implementation - in a real app, you'd use a more robust HTML parser
        const extractedData = await extractResumeDataFromHtml(htmlContent);

        res.status(200).json({ 
            message: "Resume HTML parsed successfully.",
            resumeData: extractedData
        });

    } catch (error) {
        console.error('Error in parseResumeHtml controller:', error);
        res.status(500).json({ 
            message: 'Failed to parse resume HTML.', 
            error: error.message, 
        });
    }
};

// Controller function to update resume with edited data
exports.updateResume = async (req, res) => {
    try {
        const { resumeData } = req.body;

        // --- Input Validation ---
        if (!resumeData) {
            return res.status(400).json({ message: 'Missing resume data for update.' });
        }

        console.log("Updating resume with edited data...");

        // Log education data specifically to debug graduation year issue
        if (resumeData.education && resumeData.education.length > 0) {
            console.log('Education data received:', JSON.stringify(resumeData.education, null, 2));
            
            // Replace any "Extracted from resume" values with the actual value from the input
            // This ensures that when a user edits a field with "Extracted from resume", 
            // the edited value is used instead
            resumeData.education.forEach((edu, index) => {
                // For debugging purposes
                console.log(`Processing education item ${index}:`, edu);
                
                // If we detect the placeholder value, use the value from the form input
                if (edu.graduationYear === "Extracted from resume") {
                    // Log this for debugging
                    console.log(`Found "Extracted from resume" value in education[${index}].graduationYear`);
                }
            });
        }

        // Format the data properly for the template service
        const templateData = {
            generatedSections: resumeData
        };
        
        const selectedTemplate = 'default.ejs'; // Using default template
        const updatedHtml = await templateService.renderTemplate(selectedTemplate, templateData);
        
        res.status(200).json({ 
            message: "Resume updated successfully.",
            updatedHtml: updatedHtml
        });

    } catch (error) {
        console.error('Error in updateResume controller:', error);
        res.status(500).json({ 
            message: 'Failed to update resume.', 
            error: error.message, 
        });
    }
};

// Helper function to extract resume data from HTML
// This is a simplified implementation - in a real app, you'd use a more robust HTML parser
async function extractResumeDataFromHtml(htmlContent) {
    try {
        // Create a simple parser using DOM methods
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        
        // Extract structured data
        const resumeData = {
            contactInfo: {
                name: document.querySelector('h1')?.textContent || '',
                location: '',
                email: '',
                phone: '',
                linkedin: ''
            },
            summaryOrObjective: '',
            experience: [],
            education: [],
            skills: {}
        };

        // Extract contact info
        const contactSection = document.querySelector('.contact-info');
        if (contactSection) {
            const contactText = contactSection.textContent;
            
            // Simple regex extractions - this is a basic implementation
            const locationMatch = contactText.match(/^([^|]+)/);
            if (locationMatch) resumeData.contactInfo.location = locationMatch[1].trim();
            
            // Improved phone number extraction - look for phone pattern more carefully
            // First, try to find a pattern that looks like a phone number
            const phonePattern = /\|\s*([0-9()\s\-+.]{7,})\s*\|/;
            const phoneMatch = contactText.match(phonePattern);
            if (phoneMatch) {
                resumeData.contactInfo.phone = phoneMatch[1].trim();
            } else {
                // Fallback: try to extract any content between pipes that might be a phone number
                const allParts = contactText.split('|').map(part => part.trim());
                // Look for a part that might be a phone number (contains digits)
                const possiblePhone = allParts.find(part => /\d/.test(part));
                if (possiblePhone) {
                    resumeData.contactInfo.phone = possiblePhone;
                }
            }
            
            const emailLink = contactSection.querySelector('a[href^="mailto:"]');
            if (emailLink) resumeData.contactInfo.email = emailLink.textContent.trim();
            
            const linkedinLink = contactSection.querySelector('a[href*="linkedin"]');
            if (linkedinLink) resumeData.contactInfo.linkedin = linkedinLink.getAttribute('href');
        }

        // Extract summary
        const summarySection = Array.from(document.querySelectorAll('.section')).find(section => 
            section.querySelector('h2')?.textContent === 'Summary / Objective'
        );
        if (summarySection) {
            const summaryParagraph = summarySection.querySelector('p');
            if (summaryParagraph) resumeData.summaryOrObjective = summaryParagraph.textContent;
        }

        // Extract experience
        const experienceSection = Array.from(document.querySelectorAll('.section')).find(section => 
            section.querySelector('h2')?.textContent === 'Professional Experience'
        );
        if (experienceSection) {
            const jobs = experienceSection.querySelectorAll('.job');
            jobs.forEach(job => {
                const title = job.querySelector('h3')?.textContent || '';
                const details = job.querySelector('p')?.textContent || '';
                
                // Parse company, location, dates from the details text
                let company = '', location = '', dates = '';
                const detailsParts = details.split('|').map(part => part.trim());
                if (detailsParts.length >= 3) {
                    company = detailsParts[0];
                    location = detailsParts[1];
                    dates = detailsParts[2];
                }
                
                // Extract bullet points
                const bullets = Array.from(job.querySelectorAll('li')).map(li => li.textContent);
                
                resumeData.experience.push({
                    title,
                    company,
                    location,
                    dates,
                    bullets
                });
            });
        }

        // Extract education
        const educationSection = Array.from(document.querySelectorAll('.section')).find(section => 
            section.querySelector('h2')?.textContent === 'Education'
        );
        if (educationSection) {
            const degrees = educationSection.querySelectorAll('.degree');
            degrees.forEach(degree => {
                const degreeTitle = degree.querySelector('h3')?.textContent || '';
                const details = degree.querySelector('p')?.textContent || '';
                
                // Parse degree and major from the title
                let degreeType = '', major = '';
                const titleParts = degreeTitle.split(',').map(part => part.trim());
                if (titleParts.length >= 2) {
                    degreeType = titleParts[0];
                    major = titleParts[1];
                }
                
                // Parse institution and year from details
                let institution = '', graduationYear = '';
                const detailsParts = details.split('-').map(part => part.trim());
                if (detailsParts.length >= 2) {
                    institution = detailsParts[0];
                    graduationYear = detailsParts[1];
                }
                
                // Get additional details if present
                const additionalDetails = degree.querySelectorAll('p')[1]?.textContent || '';
                
                resumeData.education.push({
                    degree: degreeType,
                    major,
                    institution,
                    graduationYear,
                    details: additionalDetails
                });
            });
        }

        // Extract skills
        const skillsSection = Array.from(document.querySelectorAll('.section')).find(section => 
            section.querySelector('h2')?.textContent === 'Skills'
        );
        if (skillsSection) {
            const skillCategories = skillsSection.querySelectorAll('.skills-category');
            skillCategories.forEach(category => {
                const categoryName = category.querySelector('h3')?.textContent.toLowerCase() || 'general';
                const skills = Array.from(category.querySelectorAll('li')).map(li => li.textContent);
                
                resumeData.skills[categoryName] = skills;
            });
        }

        return resumeData;
    } catch (error) {
        console.error('Error extracting resume data from HTML:', error);
        throw new Error(`Failed to extract resume data: ${error.message}`);
    }
}
