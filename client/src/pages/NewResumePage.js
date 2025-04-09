import React, { useState } from 'react';
import JobUrlInput from '../components/upload/JobUrlInput';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import EducationForm from '../components/forms/EducationForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import SkillsForm from '../components/forms/SkillsForm';

const NewResumePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    linkedIn: '',
    website: ''
  });
  const [education, setEducation] = useState([{
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: ''
  }]);
  const [experience, setExperience] = useState([{
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  }]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { name: 'Job Information', description: 'Provide job details' },
    { name: 'Personal Information', description: 'Your contact details' },
    { name: 'Education', description: 'Your educational background' },
    { name: 'Experience', description: 'Your work history' },
    { name: 'Skills', description: 'Your skills and competencies' }
  ];

  const handleJobUrlChange = (url) => {
    setJobUrl(url);
    // Use more robust URL validation
    try {
      // Empty URL is valid (user hasn't entered anything yet)
      setIsUrlValid(url === '' || Boolean(new URL(url)));
    } catch {
      setIsUrlValid(false);
    }
  };

  const handleJobDescriptionChange = (description) => {
    setJobDescription(description);
  };

  const handlePersonalInfoChange = (info) => {
    setPersonalInfo(info);
  };

  const handleEducationChange = (educationData) => {
    setEducation(educationData);
  };

  const handleExperienceChange = (experienceData) => {
    setExperience(experienceData);
  };

  const handleSkillsChange = (skillsData) => {
    setSkills(skillsData);
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!jobUrl && !jobDescription) {
        setError('Please provide either a job URL or job description');
        return;
      }
      
      if (jobUrl && !isUrlValid) {
        setError('Please enter a valid URL');
        return;
      }
    } else if (activeStep === 1) {
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
        setError('Please provide at least your first name, last name, and email');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      console.log('Submitting form data:', {
        jobUrl,
        jobDescription,
        personalInfo,
        education,
        experience,
        skills
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to results page (to be implemented)
      alert('Resume created successfully! Redirecting to results page...');
      
    } catch (err) {
      setError('Error creating resume. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <h3 className="mb-3">Job Information</h3>
            <p className="text-gray-600 mb-4">
              Provide either a job posting URL or paste the job description to tailor your resume.
            </p>
            
            <div className="mb-4">
              <JobUrlInput 
                value={jobUrl} 
                onChange={handleJobUrlChange} 
                isValid={isUrlValid}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="jobDescription">
                Or paste job description
              </label>
              <textarea
                id="jobDescription"
                className="input h-40"
                value={jobDescription}
                onChange={(e) => handleJobDescriptionChange(e.target.value)}
                placeholder="Paste the job description here..."
              ></textarea>
            </div>
          </div>
        );
      case 1:
        return (
          <PersonalInfoForm 
            personalInfo={personalInfo} 
            onChange={handlePersonalInfoChange} 
          />
        );
      case 2:
        return (
          <EducationForm 
            education={education} 
            onChange={handleEducationChange} 
          />
        );
      case 3:
        return (
          <ExperienceForm 
            experience={experience} 
            onChange={handleExperienceChange} 
          />
        );
      case 4:
        return (
          <SkillsForm 
            skills={skills} 
            onChange={handleSkillsChange} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-center mb-8">Create a New Resume</h1>
      
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, index) => (
              <li key={step.name} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activeStep === index
                        ? 'bg-primary-light text-white'
                        : activeStep > index
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {activeStep > index ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className={`hidden sm:block ml-4 ${index === steps.length - 1 ? '' : 'w-full border-t border-gray-300'}`} />
                </div>
                <div className="hidden sm:block absolute top-0 mt-12 w-32 text-center text-xs font-medium text-gray-500">
                  {step.name}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      
      <div className="card mb-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-outline"
              disabled={activeStep === 0}
            >
              Back
            </button>
            
            {activeStep === steps.length - 1 ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Resume...
                  </span>
                ) : (
                  'Create Resume'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewResumePage;
