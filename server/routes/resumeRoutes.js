// server/routes/resumeRoutes.js
const express = require('express');
const resumeController = require('../controllers/resumeController');
// Add authentication middleware if needed later
// const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/resume/generate - Endpoint to generate a new resume or tailor an existing one
router.post('/generate', /* authMiddleware, */ resumeController.generateResume);

// POST /api/resume/chat - Endpoint for chat interaction and rebuild requests
router.post('/chat', /* authMiddleware, */ resumeController.handleChat);

// POST /api/resume/download - Endpoint to download the resume in different formats
router.post('/download', /* authMiddleware, */ resumeController.downloadResume);

// Parse HTML content into structured resume data
router.post('/parse', resumeController.parseResumeHtml);

// Update resume with edited data
router.post('/update', resumeController.updateResume);

// Add other resume-related routes here if needed (e.g., getting templates)

module.exports = router;
