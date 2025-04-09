// server/services/llmService.js
require('dotenv').config({ path: '../.env' }); // Ensure correct path to .env
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.warn("GEMINI_API_KEY is not set in environment variables. LLM service will not function.");
}
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Use the specific model requested (ensure compatibility)
const modelName = "gemini-2.5-pro-preview-03-25"; 

async function generateResumeContent(resumeData, jobDescription, userInstructions = '') {
    try {
        console.log('Generating resume content with LLM...');
        
        // Ensure we have the necessary API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }

        // Validate input data
        if (!resumeData) {
            throw new Error('Missing resume data for LLM generation');
        }
        
        if (!jobDescription || !jobDescription.text) {
            throw new Error('Missing job description for LLM generation');
        }
        
        // Log the structure of the input data for debugging
        console.log('Resume data structure:', {
            hasRawText: !!resumeData.rawText || !!resumeData.extractedText,
            hasName: !!resumeData.name,
            hasContact: !!resumeData.contact,
            hasExperience: Array.isArray(resumeData.experience),
            hasEducation: Array.isArray(resumeData.education),
            hasSkills: !!resumeData.skills
        });

        // Initialize the Gemini API client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Construct a detailed prompt for resume generation
        const prompt = `
        You are an expert resume writer. Your task is to create a tailored resume based on a candidate's existing resume and a job description.
        
        Here is the candidate's resume information:
        ${JSON.stringify(resumeData, null, 2)}
        
        Here is the job description:
        ${jobDescription.text}
        
        IMPORTANT INSTRUCTIONS:
        1. Create a resume that highlights the candidate's relevant skills and experience for this specific job.
        2. Use the job description to identify key skills, qualifications, and experiences to emphasize.
        3. Maintain a professional tone and use action verbs.
        4. Be concise but comprehensive.
        5. Do not fabricate information - only use what's provided in the candidate's resume.
        6. Your response must be in valid JSON format with the following structure:
        
        {
          "contactInfo": {
            "name": "Candidate's full name",
            "phone": "Phone number",
            "email": "Email address",
            "linkedin": "LinkedIn URL",
            "portfolio": "Portfolio URL (if applicable)",
            "location": "City, State"
          },
          "summaryOrObjective": "A compelling professional summary tailored to the job",
          "experience": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "City, State",
              "dates": "Start Date - End Date",
              "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
            }
          ],
          "education": [
            {
              "degree": "Degree Name",
              "major": "Major",
              "institution": "Institution Name",
              "graduationYear": "Year",
              "details": "Additional details (optional)"
            }
          ],
          "skills": {
            "technical": ["Skill 1", "Skill 2", "Skill 3"],
            "soft": ["Skill 1", "Skill 2", "Skill 3"]
          },
          "certifications": ["Certification 1", "Certification 2"],
          "projects": [
            {
              "name": "Project Name",
              "description": "Brief description",
              "bullets": ["Detail 1", "Detail 2"]
            }
          ]
        }
        
        IMPORTANT: Ensure your response is ONLY the JSON object with no additional text before or after.
        
        ${userInstructions ? `Additional instructions: ${userInstructions}` : ''}
        
        `;

        // Generate content using the LLM
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Raw response from LLM:\n', text);
        
        // Extract JSON from the response text
        let jsonStr = text;
        
        // Check if the response is wrapped in markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonStr = jsonMatch[1];
            console.log('Extracted JSON from markdown code block');
        }
        
        // Parse the JSON response
        try {
            const parsedJson = JSON.parse(jsonStr);
            console.log('Successfully parsed JSON from LLM response');
            
            // Validate the parsed JSON structure
            if (!parsedJson.contactInfo) {
                console.warn('Missing contactInfo in LLM response, adding empty object');
                parsedJson.contactInfo = { name: '', phone: '', email: '', linkedin: '', location: '' };
            }
            
            if (!parsedJson.summaryOrObjective) {
                console.warn('Missing summaryOrObjective in LLM response, adding empty string');
                parsedJson.summaryOrObjective = '';
            }
            
            if (!parsedJson.experience || !Array.isArray(parsedJson.experience)) {
                console.warn('Missing or invalid experience array in LLM response, adding empty array');
                parsedJson.experience = [];
            }
            
            if (!parsedJson.education || !Array.isArray(parsedJson.education)) {
                console.warn('Missing or invalid education array in LLM response, adding empty array');
                parsedJson.education = [];
            }
            
            if (!parsedJson.skills) {
                console.warn('Missing skills in LLM response, adding empty object');
                parsedJson.skills = { technical: [], soft: [] };
            } else if (Array.isArray(parsedJson.skills)) {
                // Convert skills array to object format
                console.warn('Skills is an array, converting to object format');
                const skillsArray = parsedJson.skills;
                parsedJson.skills = { technical: skillsArray, soft: [] };
            }
            
            return parsedJson;
        } catch (parseError) {
            console.error('Failed to parse JSON from LLM response:', parseError);
            
            // Attempt to extract JSON even if there's text around it
            const jsonRegex = /\{[\s\S]*\}/;
            const extractedJson = text.match(jsonRegex);
            
            if (extractedJson) {
                try {
                    console.log('Attempting to parse extracted JSON portion');
                    const parsedJson = JSON.parse(extractedJson[0]);
                    console.log('Successfully parsed extracted JSON portion');
                    return parsedJson;
                } catch (secondParseError) {
                    console.error('Failed to parse extracted JSON portion:', secondParseError);
                }
            }
            
            // If all parsing attempts fail, return a minimal valid structure
            console.error('Returning fallback resume structure due to parsing failure');
            return {
                contactInfo: { name: '', phone: '', email: '', linkedin: '', location: '' },
                summaryOrObjective: 'Failed to generate summary from LLM.',
                experience: [],
                education: [],
                skills: { technical: [], soft: [] },
                certifications: []
            };
        }
    } catch (error) {
        console.error('Error in generateResumeContent:', error);
        // Return a minimal valid structure instead of throwing
        return {
            contactInfo: { name: '', phone: '', email: '', linkedin: '', location: '' },
            summaryOrObjective: `Error generating resume: ${error.message}`,
            experience: [],
            education: [],
            skills: { technical: [], soft: [] },
            certifications: []
        };
    }
}

// New function to handle chat interactions
async function handleResumeChat(chatHistory, currentMessage, originalResumeData, jobDescriptionData) {
    if (!genAI) {
        throw new Error("LLM service is not initialized. Check GEMINI_API_KEY.");
    }
    const model = genAI.getGenerativeModel({ model: modelName });

    // Construct a prompt for the chat interaction
    // Include history for context
    const historyString = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const prompt = `\n        **Context:**
        You are an AI assistant helping a user review and refine their generated resume based on their original resume data and a target job description. Below is the conversation history and the user's latest message.

        **Original Resume Data (for context):**
        \`\`\`json
        ${JSON.stringify(originalResumeData, null, 2)}
        \`\`\`

        **Target Job Description (for context):**
        \`\`\`text
        ${jobDescriptionData.text || 'No specific job description text provided.'}
        \`\`\`

        **Chat History:**
        ${historyString}
        
        **User's Latest Message:**
        ${currentMessage}

        **Your Task:**
        Respond helpfully and concisely to the user's latest message in the context of the resume and job description. Answer questions about the generated resume, provide suggestions, or acknowledge feedback. Do not regenerate the resume unless explicitly asked via a specific command (which is handled elsewhere). Keep your response conversational.

        **Format Requirements:**
        Format your response using markdown for better readability:
        - Use **bold** for emphasis
        - Use bullet points for lists
        - Use headings (##, ###) for sections
        - Use code blocks for examples
        - Use numbered lists for steps

        **AI Response:**
    `;

    try {
        console.log("Sending chat prompt to LLM...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Received chat response from LLM.");
        
        // Basic check for response existence
        if (!text) {
            console.error("LLM chat API returned an empty response text.");
            throw new Error("Received no content from the LLM service for chat.");
        }
        
        // Return the raw text response for chat
        return text; 

    } catch (error) {
        console.error('Error handling resume chat with LLM:', error);
        throw new Error(`LLM service failed during chat: ${error.message}`);
    }
}

module.exports = {
    generateResumeContent,
    handleResumeChat // Export the new function
};
