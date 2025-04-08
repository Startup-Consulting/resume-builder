const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Configure Multer for file uploads
// Store file in memory as a Buffer
const storage = multer.memoryStorage(); 

// File filter (optional - can add more specific checks)
const fileFilter = (req, file, cb) => {
  // Accept specific resume types
  const allowedMimes = [
    'application/pdf',
    'text/plain',
    // Add Word and Excel MIME types later
    // 'application/msword', 
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // 'application/vnd.ms-excel',
    // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Rejected file type: ${file.mimetype}`);
    // Reject file, passing specific error message potential
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Set limits (e.g., 10MB file size limit)
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
};

// Initialize Multer upload middleware
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: limits 
}).single('resumeFile'); // 'resumeFile' must match the name attribute in the frontend form data

// Define the upload route
// It will first use the upload middleware, then the controller function
router.post('/resume', (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., file size limit)
      console.error('Multer error:', err);
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred (e.g., file type filter rejection)
      console.error('Unknown upload error:', err);
       // Use the error message from the file filter if available
      return res.status(400).json({ message: err.message || 'File upload failed.' });
    }
    // Everything went fine, proceed to controller
    next();
  });
}, uploadController.uploadResume);

module.exports = router;
