import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center">
      <section className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Create the Perfect Resume for Your Dream Job
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Our Resume Builder helps you create tailored resumes that align perfectly with job requirements,
          increasing your chances of landing interviews.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/upload" className="btn btn-primary text-center">
            Tailor Existing Resume
          </Link>
          <Link to="/new-resume" className="btn btn-outline text-center">
            Create New Resume
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
        <div className="card">
          <h3 className="mb-3">Upload Your Resume</h3>
          <p className="text-gray-600 mb-4">
            Upload your existing resume in PDF, Word, or text format and we'll help you optimize it.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-3">Provide Job Description</h3>
          <p className="text-gray-600 mb-4">
            Enter the URL or paste the job description you're applying for.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-3">Get Tailored Resume</h3>
          <p className="text-gray-600 mb-4">
            Receive a professionally formatted resume optimized for your target job.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 p-8 rounded-lg w-full max-w-6xl">
        <h2 className="text-center mb-6">Why Use Our Resume Builder?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-primary text-white p-2 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2">ATS-Friendly Formatting</h3>
              <p className="text-gray-600">Our resumes are designed to pass through Applicant Tracking Systems.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white p-2 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2">Keyword Optimization</h3>
              <p className="text-gray-600">We analyze job descriptions to include relevant keywords in your resume.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white p-2 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2">Professional Templates</h3>
              <p className="text-gray-600">Choose from a variety of professional templates for different industries.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white p-2 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2">Easy Download</h3>
              <p className="text-gray-600">Download your resume in multiple formats including PDF and Word.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
