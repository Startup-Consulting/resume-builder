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

async function generateResumeContent(resumeData, jobDescription, userInstructions) {
    if (!genAI) {
        throw new Error("LLM service is not initialized. Check GEMINI_API_KEY.");
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    // --- Updated Prompt based on User Guidelines --- 
    const prompt = `
        **Objective:**
        Generate a professional resume tailored to the Target Job Description, using the provided Candidate Profile information. Follow the specified structure and content guidelines strictly. **IMPORTANT: Only include sections for which relevant information exists in the Candidate Profile. If no information is provided for a section (e.g., Education, Certifications), omit that section entirely from the output.**

        **Candidate Profile:**
        This JSON object contains the candidate's raw information, potentially extracted from an uploaded resume or entered manually. Structure might vary, but look for common keys like 'name', 'contact', 'email', 'phone', 'linkedin', 'summary', 'objective', 'experience' (array of jobs with 'title', 'company', 'location', 'dates', 'responsibilities'/'achievements'), 'skills' (array or object), 'education' (array of degrees with 'degree', 'major', 'institution', 'graduationYear', 'gpa'), 'certifications', 'projects', 'awards', 'volunteerWork', 'professionalAffiliations'.
        \`\`\`json
        ${JSON.stringify(resumeData, null, 2)} 
        \`\`\`

        **Target Job Description:**
        Use this to tailor the content, focusing on keywords and requirements.
        \`\`\`text
        ${jobDescription.text || 'No specific job description text provided.'}
        \`\`\`
        ${jobDescription.keywords ? `\n**Key Job Keywords:**\n${jobDescription.keywords.join(', ')}` : ''}

        **User Instructions (Optional Overrides):**
        ${userInstructions || 'Standard tailoring based on job description.'}

        **Resume Generation Task:**
        Generate the resume content section by section, adhering to the guidelines below. Remember the rule: **No data = No section.**

        1.  **Contact Information:** 
            *   Include: Full name, phone number, professional email, LinkedIn profile URL (if available), City/State (if available). 
            *   Format professionally.
            *   Only include if present in the Candidate Profile.

        2.  **Resume Summary or Objective:**
            *   Generate a concise (2-3 sentences) summary (for experienced candidates) or objective (for entry-level/career changers) tailored to the Target Job Description.
            *   Use keywords from the job description.
            *   Only include if the Candidate Profile contains a summary/objective or enough experience/skills to create one.

        3.  **Professional Experience:**
            *   List jobs in reverse chronological order.
            *   Include: Job title, company name, location, dates (Month/Year).
            *   For each job, write 3-5 bullet points using action verbs and quantifying achievements where possible (STAR method). Integrate job description keywords naturally.
            *   Only include if the 'experience' array exists and has entries in the Candidate Profile.

        4.  **Skills:**
            *   List relevant hard and soft skills matching the job requirements.
            *   Prioritize skills mentioned in the job posting.
            *   Categorize if appropriate (e.g., Technical Skills, Languages, Tools, Soft Skills).
            *   Only include if 'skills' information is present in the Candidate Profile.

        5.  **Education:**
            *   Include: Degree(s), major, institution, graduation year. Optionally GPA (if high), relevant coursework/honors for recent grads.
            *   Format clearly.
            *   Only include if 'education' information is present in the Candidate Profile.

        6.  **Optional Sections (Include ONLY if data exists in Candidate Profile AND they add value):**
            *   **Certifications:** Name, issuing body, date.
            *   **Projects:** Name, description, tech used, outcome.
            *   **Awards and Honors:** Recognition, context.
            *   **Volunteer Work:** Role, organization, dates, contributions.
            *   **Professional Affiliations:** Membership, role/dates.

        **Output Format:**
        Provide the response as a single, valid JSON object. Use the following keys for the sections. **Crucially, only include a key-value pair for a section if you generated content for it based on the presence of data in the Candidate Profile.** Do not include keys with null or empty values for omitted sections.
        \`\`\`json
        {
          "contactInfo": {
            "name": "<Full Name>",
            "phone": "User's phone number (e.g., +1 123-456-7890)",
            "email": "User's email address",
            "linkedin": "Full LinkedIn profile URL including https:// (e.g., https://www.linkedin.com/in/username)",
            "portfolio": "Full portfolio/website URL including https:// (if provided)",
            "location": "<City, State (optional)>"
          },
          "summaryOrObjective": "<Generated summary or objective text>",
          "experience": [
            {
              "title": "<Job Title>",
              "company": "<Company Name>",
              "location": "<Location>",
              "dates": "<Dates>",
              "bullets": [
                "<Bullet point 1>",
                "<Bullet point 2>"
              ]
            }
            // ... more job entries
          ],
          "skills": {
            "technical": ["<Skill 1>", "<Skill 2>"],
            "soft": ["<Skill 3>", "<Skill 4>"],
            // ... other categories if applicable
            "other": ["<Skill 5>"]
          },
          "education": [
            {
              "degree": "<Degree Name>",
              "major": "<Major>",
              "institution": "<Institution Name>",
              "graduationYear": "<Year>",
              "details": "<Optional: GPA, Honors, Coursework>"
            }
            // ... more degrees
          ],
          // --- Optional Sections (Only include if data exists) ---
          "certifications": [
            {
              "name": "<Certification Name>",
              "organization": "<Issuing Body>",
              "date": "<Date Earned>"
            }
          ],
          "projects": [
            {
              "name": "<Project Name>",
              "description": "<Description>",
              "technologies": "<Tech Used>",
              "outcome": "<Outcome>"
            }
          ],
          "awards": [
            "<Award/Honor 1>",
            "<Award/Honor 2>"
          ],
          "volunteerWork": [
             {
              "role": "<Role>",
              "organization": "<Organization>",
              "dates": "<Dates>",
              "description": "<Contributions>"
            }
          ],
          "professionalAffiliations": [
             "<Affiliation 1>",
             "<Affiliation 2>"
          ]
        }
        \`\`\`

    `;

    try {
        console.log(`Sending prompt to Gemini model (${modelName}). Length: ${prompt.length} chars`);
        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Basic check for response existence
        if (!response || !response.text) {
            console.error("Gemini API returned an empty response.");
            throw new Error("Received no content from the LLM service.");
        }

        const text = response.text();
        console.log(`Received response from Gemini. Length: ${text.length} chars`);

        // Attempt to parse the JSON response
        try {
            // Remove potential leading/trailing markdown code fences/whitespace more robustly
            const cleanedText = text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const parsedJson = JSON.parse(cleanedText);
            console.log("Successfully parsed LLM response.");
            return parsedJson;
        } catch (parseError) {
            console.error("Failed to parse LLM response JSON:", parseError);
            console.error("Raw LLM Response Text:\n---\n", text, "\n---");
            throw new Error(`Failed to parse the generated content from the LLM. Raw text: ${text.substring(0, 100)}...`); // Include snippet in error
        }

    } catch (error) {
        // Catch API call errors and parsing errors
        console.error("Error during LLM interaction or parsing:", error);
        // Rethrow a more generic error for the controller 
        throw new Error(`LLM service failed: ${error.message}`); 
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
