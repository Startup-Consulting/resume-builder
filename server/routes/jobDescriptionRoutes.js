const express = require('express');
const jobDescriptionController = require('../controllers/jobDescriptionController');

const router = express.Router();

// Define the route for fetching job description from URL
router.post('/fetch-from-url', jobDescriptionController.fetchJobDescription);

// Later, we might add routes for keyword analysis, etc.
// router.post('/analyze', jobDescriptionController.analyzeDescription);

module.exports = router;
