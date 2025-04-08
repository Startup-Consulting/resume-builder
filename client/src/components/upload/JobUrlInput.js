import React from 'react';

const JobUrlInput = ({ value, onChange, isValid }) => {
  return (
    <div>
      <label className="block text-gray-700 mb-2" htmlFor="jobUrl">
        Job posting URL
      </label>
      <input
        type="text"
        id="jobUrl"
        className={`input ${!isValid ? 'border-red-500' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/job-posting"
      />
      {!isValid && (
        <p className="text-red-500 text-sm mt-1">
          Please enter a valid URL
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Enter the URL of the job posting you're applying for
      </p>
    </div>
  );
};

export default JobUrlInput;
