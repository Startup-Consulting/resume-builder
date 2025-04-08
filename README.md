# Resume Builder Application

A web application designed to help users create or tailor resumes for specific job opportunities, optimizing the alignment between candidate qualifications and job requirements.

## Project Overview

This application provides two main functionalities:

1.  **Create New Resume**: Users input their personal information, skills, experience, and education, along with a job description (URL or text). The system generates a resume tailored to the job.
2.  **Tailor Existing Resume**: Users upload their existing resume (PDF, Word, Excel, or text) and provide a job description. The system analyzes both and generates an optimized resume version.

Built following the guidelines outlined in the `.windsurfrules` document.

## Technical Stack

-   **Frontend**: React, Tailwind CSS
-   **Backend**: Node.js, Express.js
-   **Database & Authentication**: Supabase (PostgreSQL)
-   **AI Integration**: Google Generative AI (Gemini) for resume tailoring

## Features

### Implemented Features

-   **Resume Upload**: Support for PDF, Word, and text formats
-   **Job Description Input**: Enter URL or paste job description text
-   **Resume Tailoring**: AI-powered resume optimization based on job requirements
-   **Resume Editing**: In-place editing of generated resumes
-   **Download Options**: Export as PDF, DOCX, or Markdown
-   **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   Supabase account (for database and authentication)
-   Google Generative AI API key (for resume tailoring)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd resume-builder
    ```

2.  **Install dependencies for both server and client:**
    ```bash
    npm run install-all
    # or
    # yarn install-all
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the root directory.
    -   Copy the contents of `.env.example` (if it exists) or use the following template:
        ```env
        # Server configuration
        PORT=5001

        # Supabase configuration (replace with your actual credentials)
        SUPABASE_URL=YOUR_SUPABASE_URL
        SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
        
        # Google Generative AI API
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
    -   Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_GEMINI_API_KEY` with your actual credentials.

### Running the Application

To run both the client and server concurrently in development mode:

```bash
npm run dev
# or
# yarn dev
```

This command will:
-   Start the backend server (usually on `http://localhost:5001`).
-   Start the frontend React development server (usually on `http://localhost:3000`).

The application should automatically open in your default browser. If not, navigate to `http://localhost:3000`.

## How to Use

### Tailoring an Existing Resume

1. Navigate to the upload page at `http://localhost:3000/upload`
2. Upload your existing resume (PDF, DOCX, or TXT format)
3. Either paste a job description or provide a job posting URL
4. Click "Tailor My Resume" to generate a tailored version of your resume
5. Review the generated resume and make any necessary edits using the "Edit Resume" button
6. Download your tailored resume in your preferred format (PDF, DOCX, or Markdown)

### Chatting with the Resume Assistant

1. After generating your resume, use the chat interface on the right side of the review page
2. Ask questions about your resume or request specific changes
3. Type `/rebuild` in the chat to regenerate your resume based on the conversation

## AI Integration

The Resume Builder uses Google's Generative AI (Gemini) to:

-   Analyze job descriptions and identify key requirements
-   Extract relevant information from uploaded resumes
-   Generate tailored content that highlights matching qualifications
-   Provide intelligent responses in the chat interface

The AI integration ensures that each resume is optimized for applicant tracking systems (ATS) while maintaining a professional and personalized presentation.

## Available Scripts

-   `npm start` or `yarn start`: Starts the production server.
-   `npm run server` or `yarn server`: Starts the backend server using nodemon for auto-reloading during development.
-   `npm run client` or `yarn client`: Starts the frontend development server.
-   `npm run dev` or `yarn dev`: Starts both client and server concurrently.
-   `npm run install-all` or `yarn install-all`: Installs dependencies for both root and client directories.
-   `npm run build` or `yarn build` (in `client` directory): Builds the React app for production.
-   `npm test` or `yarn test` (in `client` directory): Runs the React app tests.

## Project Structure

```
resume-builder/
├── client/         # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── styles/     # CSS and Tailwind setup
│   │   ├── utils/      # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── docs/           # Project documentation (PRD, Implementation)
├── server/         # Node.js Express backend
│   ├── controllers/ # Request handling logic
│   ├── middleware/  # Express middleware
│   ├── models/      # Database models/schemas (if needed)
│   ├── routes/      # API route definitions
│   ├── services/     # Service layer (LLM, template, download)
│   ├── templates/    # EJS templates for resume rendering
│   ├── utils/       # Utility functions
│   └── index.js     # Server entry point
├── .env            # Environment variables (ignored by git)
├── .gitignore
├── .windsurfrules  # Project-specific AI rules
├── package.json
└── README.md
```

## Recent Updates

-   **Fixed Resume Generation**: Improved the "Tailor My Resume" functionality to ensure all resume sections are properly populated
-   **Enhanced Error Handling**: Added robust error handling throughout the application to prevent crashes
-   **Improved Data Normalization**: Ensured consistent data structure between the LLM service and template rendering
-   **Updated Response Format**: Changed server responses to include both HTML and structured data for better editing support

## Upcoming Features

-   **User Authentication**: Implement user accounts and resume saving
-   **Resume Templates**: Add more design templates for different industries
-   **Keyword Analysis**: Visual highlighting of matching keywords between resume and job description
-   **Collaborative Editing**: Allow sharing and collaborative editing of resumes
-   **Advanced Analytics**: Provide insights on resume effectiveness and suggestions for improvement

## Contributing

Follow the guidelines in `.windsurfrules` for development practices.

## Troubleshooting

### Common Issues

-   **Port Already in Use**: If you see an `EADDRINUSE` error when starting the server, you can kill the process using that port with:
    ```bash
    lsof -i :5001  # Find the PID
    kill <PID>     # Kill the process
    ```
-   **Missing API Key**: If resume generation fails, ensure your `GEMINI_API_KEY` is correctly set in the `.env` file
-   **Resume Upload Issues**: Ensure your resume is in a supported format (PDF, DOCX, TXT) and is not password protected
