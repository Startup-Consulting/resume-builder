import React, { useState } from 'react';

const SkillsForm = ({ skills, onChange }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Skills</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter your skills. Press Enter or comma after each skill.
      </p>
      
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="input flex-grow mr-2"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., JavaScript, Project Management"
        />
        <button
          type="button"
          onClick={addSkill}
          className="btn btn-outline"
        >
          Add Skill
        </button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary bg-opacity-10 text-primary-dark"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-primary-dark hover:text-primary"
                aria-label={`Remove ${skill}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsForm;
