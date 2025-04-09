import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import FileUpload from '../components/upload/FileUpload';
import JobUrlInput from '../components/upload/JobUrlInput';
import FilePreview from '../components/upload/FilePreview'; 

const UploadPage = () => {
  const navigate = useNavigate(); 
  const [resumeFile, setResumeFile] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [processStatus, setProcessStatus] = useState({ 
    loading: false,
    error: null,
    step: '', 
  });

  const handleFileChange = (file) => {
    setResumeFile(file);
    setProcessStatus({ loading: false, error: null, step: '' }); 
    console.log('File selected:', file);
  };

  const handleJobUrlChange = (url) => {
    setJobUrl(url);
    setJobDescription(''); 
    setProcessStatus({ loading: false, error: null, step: '' }); 
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
    setJobUrl(''); 
    setProcessStatus({ loading: false, error: null, step: '' }); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!resumeFile || (!jobUrl && !jobDescription)) {
      console.log('Form submission prevented: Missing file or job info.');
      setProcessStatus({ loading: false, error: 'Please upload a resume and provide either a job URL or job description text.', step: '' });
      return; 
    }
    
    console.log('Starting resume tailoring process...');
    setProcessStatus({ loading: true, error: null, step: 'starting' });

    const serverPort = process.env.REACT_APP_SERVER_PORT || 5000;
    let currentJobDescription = jobDescription;
    let extractedResumeText = '';
    let generatedHtmlResult = null;

    try {
      if (jobUrl && !jobDescription) { 
        console.log('Step 0: Fetching job description from URL...');
        setProcessStatus({ loading: true, error: null, step: 'fetching' });
        try {
          // Use relative URL instead of hardcoded localhost
          const fetchResponse = await axios.post(`/api/job-description/fetch-from-url`, { jobUrl });
          if (fetchResponse.data && fetchResponse.data.extractedDescription) {
            currentJobDescription = fetchResponse.data.extractedDescription;
            setJobDescription(currentJobDescription); 
            console.log('Successfully fetched and extracted description.');
          } else {
            throw new Error('Could not extract description from the URL. Please paste it manually.');
          }
        } catch(fetchError) {
          console.error('Job description fetch error details:', fetchError);
          if (fetchError.message.includes('Network Error')) {
            throw new Error('Failed to fetch job description: Network Error. Please check your internet connection or paste the job description manually.');
          } else {
            throw new Error(`Failed to fetch job description: ${fetchError.response?.data?.message || fetchError.message}`);
          }
        }
      } else if (!currentJobDescription) {
          throw new Error('Job description is missing.');
      }

      console.log('Step 1: Uploading resume file for text extraction...');
      setProcessStatus({ loading: true, error: null, step: 'uploading' });
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      
      // Use relative URL instead of hardcoded localhost
      const uploadResponse = await axios.post(`/api/upload/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload successful:', uploadResponse.data);
      if (!uploadResponse.data || !uploadResponse.data.extractedText) {
        throw new Error('Server did not return extracted resume text after upload.');
      }
      extractedResumeText = uploadResponse.data.extractedText;

      console.log('Step 2: Calling resume generation endpoint...');
      setProcessStatus({ loading: true, error: null, step: 'generating' }); 

      const generatePayload = {
        resumeInput: { 
          data: { extractedText: extractedResumeText }, 
          source: 'upload' 
        },
        jobDescription: {
          text: currentJobDescription 
        },
        templateId: 'default', 
        userInstructions: '' 
      };

      // Use relative URL instead of hardcoded localhost
      const generateResponse = await axios.post(`/api/resume/generate`, generatePayload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resume generation successful.');
      
      // Handle the new JSON response format
      if (generateResponse.data && generateResponse.data.renderedHtml) {
        console.log('Received structured response with HTML and resume data');
        generatedHtmlResult = generateResponse.data.renderedHtml;
        
        // Store the structured resume data if available
        const resumeData = generateResponse.data.resumeData;
        
        console.log('Redirecting to review page with complete data...');
        setProcessStatus({ loading: false, error: null, step: '' }); 
        
        // Pass original data along with generated HTML and structured resume data
        navigate('/resume-review', { 
          state: { 
            generatedHtml: generatedHtmlResult, 
            originalResumeData: { extractedText: extractedResumeText }, 
            jobDescriptionData: { text: currentJobDescription },
            resumeData: resumeData // Pass the structured resume data for editing
          } 
        });
        return; // Exit early since we've handled navigation
      } else {
        // Fall back to the old behavior if we don't get the expected response format
        console.warn('Received unexpected response format from server');
        generatedHtmlResult = generateResponse.data;
      }
      
      console.log('Redirecting to review page...');
      setProcessStatus({ loading: false, error: null, step: '' }); 
      // Pass original data along with generated HTML
      navigate('/resume-review', { 
        state: { 
          generatedHtml: generatedHtmlResult, 
          originalResumeData: { extractedText: extractedResumeText }, // Pass as object matching expected structure
          jobDescriptionData: { text: currentJobDescription } // Pass as object
        } 
      });

    } catch (error) {
      console.error('Resume tailoring process failed:', error);
      const message = error.response?.data?.message || error.message || 'An unknown error occurred.';
      const stepFailed = processStatus.step || 'processing';
      setProcessStatus({ loading: false, error: `Tailoring failed during ${stepFailed}: ${message}`, step: '' });
    }
  };

  const getButtonText = () => {
    if (processStatus.loading) {
      switch(processStatus.step) {
        case 'fetching': return 'Fetching Job Info...';
        case 'uploading': return 'Uploading Resume...';
        case 'generating': return 'Generating Resume...';
        default: return 'Processing...';
      }
    }
    return 'Tailor My Resume';
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl mb-10">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Tailor Your Existing Resume</h1>
      <p className="text-center text-gray-600 mb-10">
        Upload your current resume and provide the job details. We'll optimize it!
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Upload Your Resume</h2>
          <FileUpload onFileChange={handleFileChange} acceptedTypes={['.pdf', '.txt', '.docx']} disabled={processStatus.loading} /> 
          {resumeFile && <FilePreview file={resumeFile} />}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Provide Job Information</h2>
          <p className="text-sm text-gray-600 mb-4">Enter the URL of the job posting OR paste the job description below.</p>

          <div className="mb-2">
            <JobUrlInput 
              jobUrl={jobUrl} 
              onChange={handleJobUrlChange} 
              disabled={processStatus.loading || !!jobDescription} 
            />
          </div>

          <div className="my-4 text-center text-gray-500">OR</div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Paste Job Description:
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows="10"
              className="input w-full disabled:bg-gray-100"
              placeholder="Paste the full job description here..."
              value={jobDescription} 
              onChange={handleJobDescriptionChange}
              disabled={processStatus.loading || !!jobUrl} 
            ></textarea>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto disabled:opacity-50 flex items-center justify-center"
            disabled={!resumeFile || (!jobUrl && !jobDescription) || processStatus.loading}
          >
            {processStatus.loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {getButtonText()}
          </button>
        </div>
      </form>

      <div className="mt-8">
        {processStatus.error && (
          <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md text-center">Error: {processStatus.error}</p>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
