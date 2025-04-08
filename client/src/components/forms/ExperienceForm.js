import React from 'react';

const ExperienceForm = ({ experience, onChange }) => {
  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    const updatedExperience = experience.map((exp, i) =>
      i === index ? { ...exp, [name]: updatedValue } : exp
    );
    onChange(updatedExperience);
  };

  const addExperience = () => {
    onChange([...experience, {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const removeExperience = (index) => {
    const updatedExperience = experience.filter((_, i) => i !== index);
    onChange(updatedExperience);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Work Experience</h3>
      {experience.map((exp, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 mb-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id={`company-${index}`}
                  className="input"
                  value={exp.company}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor={`position-${index}`} className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="position"
                  id={`position-${index}`}
                  className="input"
                  value={exp.position}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor={`location-${index}`} className="block text-sm font-medium text-gray-700">
                Location (e.g., City, State)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="location"
                  id={`location-${index}`}
                  className="input"
                  value={exp.location}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor={`startDate-${index}`} className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="startDate"
                  id={`startDate-${index}`}
                  className="input"
                  value={exp.startDate}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="MM/YYYY"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor={`endDate-${index}`} className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="endDate"
                  id={`endDate-${index}`}
                  className="input"
                  value={exp.endDate}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="MM/YYYY or Present"
                  disabled={exp.current}
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <div className="flex items-center">
                <input
                  id={`current-${index}`}
                  name="current"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={exp.current}
                  onChange={(e) => handleChange(index, e)}
                />
                <label htmlFor={`current-${index}`} className="ml-2 block text-sm text-gray-900">
                  I currently work here
                </label>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                Description (Responsibilities, Achievements)
              </label>
              <div className="mt-1">
                <textarea
                  id={`description-${index}`}
                  name="description"
                  rows={4}
                  className="input"
                  value={exp.description}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Start each bullet point with a strong action verb..."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Use bullet points to highlight key accomplishments and responsibilities.</p>
              </div>
            </div>
          </div>

          {experience.length > 1 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove Experience
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="mt-4">
        <button
          type="button"
          onClick={addExperience}
          className="btn btn-outline"
        >
          + Add Experience
        </button>
      </div>
    </div>
  );
};

export default ExperienceForm;
