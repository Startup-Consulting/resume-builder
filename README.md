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

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   Supabase account (for database and authentication)

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
        PORT=5000

        # Supabase configuration (replace with your actual credentials)
        SUPABASE_URL=YOUR_SUPABASE_URL
        SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    -   Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and anon key.

### Running the Application

To run both the client and server concurrently in development mode:

```bash
npm run dev
# or
# yarn dev
```

This command will:
-   Start the backend server (usually on `http://localhost:5000`).
-   Start the frontend React development server (usually on `http://localhost:3000`).

The application should automatically open in your default browser. If not, navigate to `http://localhost:3000`.

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
│   ├── utils/       # Utility functions
│   └── index.js     # Server entry point
├── .env            # Environment variables (ignored by git)
├── .gitignore
├── .windsurfrules  # Project-specific AI rules
├── package.json
└── README.md
```

## Next Steps

-   Implement backend API endpoints for:
    -   File upload and text extraction (Feature 1 & 2)
    -   Job description fetching and analysis (Feature 3)
    -   Resume generation (Feature 4)
    -   User authentication (Feature 7)
-   Connect frontend components to backend APIs.
-   Implement resume editing and preview functionality (Feature 5).
-   Add download functionality (Feature 6).
-   Integrate Supabase for data persistence and authentication.
-   Write comprehensive tests (unit, integration, e2e).

## Contributing

Follow the guidelines in `.windsurfrules` for development practices.
