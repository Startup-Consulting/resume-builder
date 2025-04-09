import React, { useState } from 'react';

const JobUrlInput = ({ value, onChange, isValid, disabled }) => {
  const [touched, setTouched] = useState(false);
  
  // Only show validation error if the field has been touched, is invalid, and has a value
  const showError = touched && !isValid && value !== '';
  
  return (
    <div>
      <label className="block text-gray-700 mb-2" htmlFor="jobUrl">
        Job posting URL
      </label>
      <input
        type="text"
        id="jobUrl"
        className={`input ${showError ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="https://example.com/job-posting"
        disabled={disabled}
      />
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          Please enter a valid URL (e.g., https://www.example.com/jobs/12345)
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Enter the URL of the job posting you're applying for
      </p>
    </div>
  );
};

export default JobUrlInput;
