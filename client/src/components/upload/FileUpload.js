import React, { useRef, useState } from 'react';

const FileUpload = ({ onFileChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
    inputRef.current.click();
  };
  
  return (
    <div>
      <label className="block text-gray-700 mb-2">Upload your resume</label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
        />
        
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          stroke="currentColor" 
          fill="none" 
          viewBox="0 0 48 48" 
          aria-hidden="true"
        >
          <path 
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        
        <div className="mt-4 flex text-sm text-gray-600">
          <p className="pl-1">
            Drag and drop your resume file here, or <span className="text-primary">browse</span>
          </p>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          PDF, Word, Excel or TXT up to 10MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
