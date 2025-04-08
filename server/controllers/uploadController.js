const pdf = require('pdf-parse');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const file = req.file;
    console.log('File received:', file.originalname, file.mimetype, file.size);

    let extractedText = '';

    // Check file type and extract text accordingly
    if (file.mimetype === 'application/pdf') {
      const data = await pdf(file.buffer);
      extractedText = data.text;
      console.log('Extracted text from PDF.');
    } else if (file.mimetype === 'text/plain') {
      extractedText = file.buffer.toString('utf8');
      console.log('Extracted text from TXT.');
    } else {
      // TODO: Add support for Word (.docx, .doc) and Excel (.xlsx)
      console.warn(`Unsupported file type: ${file.mimetype}. Extraction not performed.`);
      // For now, send a specific message, but later we might allow upload without extraction
      return res.status(400).json({ message: `File type ${file.mimetype} not yet supported for text extraction.` });
    }

    // In a real application, you would save the extracted text, 
    // associate it with the user, etc.
    // For now, just return the extracted text (or a snippet).
    res.status(200).json({ 
      message: 'File uploaded and processed successfully.', 
      filename: file.originalname,
      mimetype: file.mimetype,
      // Send the full extracted text as expected by the frontend
      extractedText: extractedText, 
      // Keep the snippet for potential future use or debugging
      extractedTextSnippet: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
    });

  } catch (error) {
    console.error('Error processing file upload:', error);
    // Differentiate between extraction errors and other errors
    if (error instanceof pdf.PdfParseException) {
        res.status(400).json({ message: 'Error parsing PDF file.', error: error.message });
    } else {
        res.status(500).json({ message: 'Server error during file processing.', error: error.message });
    }
  }
};

module.exports = {
  uploadResume,
};
