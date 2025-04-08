import React from 'react';

const EducationForm = ({ education, onChange }) => {
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = education.map((edu, i) =>
      i === index ? { ...edu, [name]: value } : edu
    );
    onChange(updatedEducation);
  };

  const addEducation = () => {
    onChange([...education, {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    }]);
  };

  const removeEducation = (index) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    onChange(updatedEducation);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Education</h3>
      {education.map((edu, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 mb-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor={`institution-${index}`} className="block text-sm font-medium text-gray-700">
                Institution
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="institution"
                  id={`institution-${index}`}
                  className="input"
                  value={edu.institution}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor={`degree-${index}`} className="block text-sm font-medium text-gray-700">
                Degree
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="degree"
                  id={`degree-${index}`}
                  className="input"
                  value={edu.degree}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor={`fieldOfStudy-${index}`} className="block text-sm font-medium text-gray-700">
                Field of Study
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="fieldOfStudy"
                  id={`fieldOfStudy-${index}`}
                  className="input"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`startDate-${index}`} className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="startDate"
                  id={`startDate-${index}`}
                  className="input"
                  value={edu.startDate}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="MM/YYYY"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`endDate-${index}`} className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="endDate"
                  id={`endDate-${index}`}
                  className="input"
                  value={edu.endDate}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`gpa-${index}`} className="block text-sm font-medium text-gray-700">
                GPA (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="gpa"
                  id={`gpa-${index}`}
                  className="input"
                  value={edu.gpa}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                Description (Optional - e.g., honors, relevant coursework)
              </label>
              <div className="mt-1">
                <textarea
                  id={`description-${index}`}
                  name="description"
                  rows={3}
                  className="input"
                  value={edu.description}
                  onChange={(e) => handleChange(index, e)}
                ></textarea>
              </div>
            </div>
          </div>

          {education.length > 1 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove Education
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="mt-4">
        <button
          type="button"
          onClick={addEducation}
          className="btn btn-outline"
        >
          + Add Education
        </button>
      </div>
    </div>
  );
};

export default EducationForm;
