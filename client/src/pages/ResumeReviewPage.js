import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import EditableResume from '../components/EditableResume';
import '../components/EditableResume.css';

const ResumeReviewPage = () => {
  const location = useLocation();
  const serverPort = process.env.REACT_APP_SERVER_PORT || 5000;
  const chatEndRef = useRef(null); // Ref to scroll chat to bottom

  // State for resume content and original data
  const [generatedHtml, setGeneratedHtml] = useState(location.state?.generatedHtml || '');
  const [originalResumeData, setOriginalResumeData] = useState(location.state?.originalResumeData || null);
  const [jobDescriptionData, setJobDescriptionData] = useState(location.state?.jobDescriptionData || null);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State for chat interface
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null); // Track which format is downloading: null | 'pdf' | 'docx' | 'md'

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial check for necessary data
  useEffect(() => {
    if (!generatedHtml || !originalResumeData || !jobDescriptionData) {
      setChatError('Missing initial data needed for review and chat.');
      // Optionally redirect or show a more prominent error
    }
  }, [generatedHtml, originalResumeData, jobDescriptionData]);

  // Parse resume data from HTML or extract from server response
  useEffect(() => {
    if (location.state?.resumeData) {
      // If we already have structured data from the server
      console.log('Using resumeData from location state:', location.state.resumeData);
      setParsedResumeData(location.state.resumeData);
    } else if (generatedHtml) {
      // Request the structured data from the server
      const fetchResumeData = async () => {
        console.log('Fetching resume data from HTML...');
        try {
          const response = await axios.post(`http://localhost:${serverPort}/api/resume/parse`, { 
            htmlContent: generatedHtml
          });
          
          console.log('Parse response:', response.data);
          if (response.data && response.data.resumeData) {
            setParsedResumeData(response.data.resumeData);
            console.log('Successfully set parsed resume data');
          } else {
            console.error('Failed to parse resume data from HTML');
            createFallbackResumeData();
          }
        } catch (error) {
          console.error('Error fetching parsed resume data:', error);
          createFallbackResumeData();
        }
      };
      
      fetchResumeData();
    }
  }, [generatedHtml, location.state, serverPort]);

  // Create a basic resume structure from the HTML as fallback
  const createFallbackResumeData = () => {
    console.log('Creating fallback resume data structure');
    
    // Extract name from HTML if possible
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(generatedHtml, 'text/html');
    const name = htmlDoc.querySelector('h1')?.textContent || 'Your Name';
    
    // Create a basic structure that matches what EditableResume expects
    const fallbackData = {
      contactInfo: {
        name: name,
        location: 'Your Location',
        email: 'your.email@example.com',
        phone: 'Your Phone',
        linkedin: 'https://linkedin.com/in/yourprofile'
      },
      summaryOrObjective: 'Your professional summary or objective statement.',
      experience: [
        {
          title: 'Job Title',
          company: 'Company Name',
          location: 'Location',
          dates: 'Start Date - End Date',
          bullets: ['Responsibility or achievement']
        }
      ],
      education: [
        {
          degree: 'Degree',
          major: 'Major',
          institution: 'Institution Name',
          graduationYear: 'Year',
          details: ''
        }
      ],
      skills: {
        technical: ['Skill 1', 'Skill 2', 'Skill 3'],
        soft: ['Skill 1', 'Skill 2', 'Skill 3']
      }
    };
    
    setParsedResumeData(fallbackData);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    console.log('Toggle edit mode. Current state:', isEditMode, 'Parsed data:', parsedResumeData);
    
    // If we don't have parsed data yet, create it before enabling edit mode
    if (!parsedResumeData && !isEditMode) {
      createFallbackResumeData();
    }
    
    setIsEditMode(prev => !prev);
  };

  // Handle save from editable resume
  const handleSaveResume = async (updatedResumeData) => {
    try {
      // Send the updated data to the server to regenerate HTML
      const response = await axios.post(`http://localhost:${serverPort}/api/resume/update`, {
        resumeData: updatedResumeData
      });
      
      if (response.data && response.data.updatedHtml) {
        // Update the HTML and parsed data
        setGeneratedHtml(response.data.updatedHtml);
        setParsedResumeData(updatedResumeData);
        
        // Exit edit mode
        setIsEditMode(false);
        
        // Add a system message
        setMessages(prev => [...prev, { sender: 'system', text: 'Resume updated successfully.' }]);
      } else {
        throw new Error('Update request did not return updated resume HTML.');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update resume.';
      setChatError(`Error: ${message}`);
      setMessages(prev => [...prev, { sender: 'system', text: `Error updating resume: ${message}` }]);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading) return;

    const newUserMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsChatLoading(true);
    setChatError(null);

    const isRebuild = userInput.trim().toLowerCase() === '/rebuild';
    const requestType = isRebuild ? 'rebuild' : 'chat';

    try {
      const response = await axios.post(`http://localhost:${serverPort}/api/resume/chat`, { 
        type: requestType,
        chatHistory: messages, // Send previous messages for context
        currentMessage: isRebuild ? null : newUserMessage.text, // Send current message only if it's not /rebuild
        originalResumeData: originalResumeData, 
        jobDescriptionData: jobDescriptionData,
      });

      if (isRebuild) {
        // Rebuild returns new HTML content
        if (response.data && response.data.updatedHtml) {
          setGeneratedHtml(response.data.updatedHtml);
          setMessages(prev => [...prev, { sender: 'system', text: 'Resume rebuilt based on feedback.' }]);
        } else {
           throw new Error('Rebuild request did not return updated resume HTML.');
        }
      } else {
        // Chat returns an AI response text
        if (response.data && response.data.response) {
           setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
        } else {
           throw new Error('Chat request did not return a valid response.');
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const message = error.response?.data?.message || error.message || 'Failed to communicate with the server.';
      setChatError(`Error: ${message}`);
      // Optionally add error message to chat
      setMessages(prev => [...prev, { sender: 'system', text: `Error processing request: ${message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Function to handle download requests
  const handleDownload = async (format) => {
    if (downloadingFormat) return; // Prevent concurrent downloads
    setDownloadingFormat(format); // Set the format being downloaded
    setChatError(null); // Clear previous errors

    try {
      console.log(`Requesting download as ${format}...`);
      const response = await axios.post(
        `http://localhost:${serverPort}/api/resume/download`,
        { 
          htmlContent: generatedHtml, // Send the HTML content from state
          format: format 
        },
        {
          responseType: 'blob', // Important for handling file downloads
        }
      );

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header if available, otherwise create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `resume.${format}`;
       if (format === 'docx') filename = 'resume.docx'; // Ensure correct extension for docx
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }

      link.download = filename;

      // Append link to the body, click it, and then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the object URL to free up memory
      window.URL.revokeObjectURL(link.href);

      console.log(`Successfully downloaded ${filename}`);
      // Optionally add a system message to chat confirming download
      // setMessages(prev => [...prev, { sender: 'system', text: `Downloaded ${filename}` }]);

    } catch (error) {
      console.error(`Error downloading resume as ${format}:`, error);
      const message = error.response?.data ? 
                      (await error.response.data.text() || `Failed to download ${format}. Server error.`) : // Try to read blob error
                      error.message || `Failed to download ${format}.`;
      setChatError(`Download Error: ${message}`);
      // Optionally add error message to chat
      // setMessages(prev => [...prev, { sender: 'system', text: `Error downloading ${format}: ${message}` }]);
    } finally {
      setDownloadingFormat(null); // Clear downloading format
    }
  };

  if (!generatedHtml || !originalResumeData || !jobDescriptionData) {
    // Handle case where the user navigates directly or data is missing
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error: Missing Resume Data</h1>
        <p className="text-gray-700 mb-6">
          {chatError || 'Could not load necessary data for the review page. Please start the process again from the upload page.'}
        </p>
        <Link to="/upload" className="btn btn-primary">
          Go to Upload Page
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 lg:space-x-4 h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
      
      {/* Left Side: Resume Preview */}
      <div className="lg:w-2/3 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg p-4 mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Resume Preview</h2>
          <p className="text-gray-700 mb-4 text-center">This is a preview of your generated resume. Ask questions or modify it in the chat. When you're ready, type /rebuild in the chat to finalize. You can also download it as a PDF, DOCX, or Markdown file below.</p>
           <div className="text-center mb-4 space-x-2"> {/* Reduced space */} 
             <Link to="/upload" className="btn btn-secondary btn-sm">
               Generate Another
             </Link>
             {/* Edit Mode Toggle Button */}
             <button
               type="button"
               onClick={toggleEditMode}
               className={`btn ${isEditMode ? 'btn-warning' : 'btn-secondary'} btn-sm`}
             >
               {isEditMode ? 'Cancel Editing' : 'Edit Resume'}
             </button>
             {/* Download Buttons */}
             <button 
               type="button" 
               onClick={() => handleDownload('pdf')} 
               className="btn btn-primary btn-sm disabled:opacity-50" 
               disabled={downloadingFormat !== null || isEditMode} // Disable if any download is active or in edit mode
             >
               {downloadingFormat === 'pdf' ? 'Downloading...' : 'Download PDF'} {/* Show loading only for PDF */}
             </button>
             <button 
               type="button" 
               onClick={() => handleDownload('docx')} 
               className="btn btn-primary btn-sm disabled:opacity-50" 
               disabled={downloadingFormat !== null || isEditMode} // Disable if any download is active or in edit mode
             >
               {downloadingFormat === 'docx' ? 'Downloading...' : 'Download DOCX'} {/* Show loading only for DOCX */}
             </button>
             <button 
               type="button" 
               onClick={() => handleDownload('md')} 
               className="btn btn-primary btn-sm disabled:opacity-50" 
               disabled={downloadingFormat !== null || isEditMode} // Disable if any download is active or in edit mode
             >
               {downloadingFormat === 'md' ? 'Downloading...' : 'Download MD'} {/* Show loading only for MD */}
             </button>
          </div>
          {parsedResumeData ? (
            <EditableResume 
              resumeData={parsedResumeData}
              onSave={handleSaveResume}
              isEditMode={isEditMode}
            />
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedHtml }}
            />
          )}
      </div>
      
      {/* Right Side: Chat Interface */}
      <div className="lg:w-1/3 flex flex-col border border-gray-300 rounded-lg bg-gray-50 shadow-lg h-full">
          <h2 className="text-xl font-semibold text-gray-800 p-3 border-b bg-gray-100 rounded-t-lg text-center">Chat & Refine</h2>
          <div className="flex-grow overflow-y-auto p-3 space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`p-2 rounded-lg max-w-[80%] text-sm ${ 
                      msg.sender === 'user' ? 'bg-blue-500 text-white' : 
                      msg.sender === 'ai' ? 'bg-gray-200 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800 border border-yellow-300 italic' // System messages
                    }`}>
                      {msg.text}
                  </div>
                </div>
              ))}
               {isChatLoading && (
                 <div className="flex justify-start">
                   <div className="p-2 rounded-lg bg-gray-200 text-gray-500 italic text-sm">AI is typing...</div>
                 </div>
               )}
               {chatError && (
                  <div className="flex justify-start">
                   <div className="p-2 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm">{chatError}</div>
                 </div>
               )}
              <div ref={chatEndRef} /> {/* Element to scroll to */}
          </div>
          <div className="p-3 border-t bg-gray-100 rounded-b-lg">
              <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask questions or type /rebuild..." 
                    className="flex-grow input input-bordered input-sm"
                    disabled={isChatLoading}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="btn btn-primary btn-sm" 
                    disabled={isChatLoading || !userInput.trim()}
                  >
                    Send
                  </button>
              </div>
          </div>
      </div>

    </div>
  );
};

export default ResumeReviewPage;
