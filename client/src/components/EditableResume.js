import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditableResume = ({ 
  resumeData, 
  onSave,
  isEditMode
}) => {
  const [editedData, setEditedData] = useState(resumeData || {});
  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when resumeData prop changes
  useEffect(() => {
    if (resumeData) {
      setEditedData(resumeData);
      setHasChanges(false); // Reset changes flag when new data is loaded
    }
  }, [resumeData]);

  // Handle text changes for simple fields
  const handleTextChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: field ? { ...prev[section], [field]: value } : value
    }));
    
    setHasChanges(true);
    // Basic validation
    validateField(section, field, value);
  };

  // Handle changes for nested array items
  const handleArrayItemChange = (section, index, field, value) => {
    setEditedData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
    setHasChanges(true);
  };

  // Handle changes for bullets in experience section
  const handleBulletChange = (jobIndex, bulletIndex, value) => {
    setEditedData(prev => {
      const newExperience = [...prev.experience];
      const newBullets = [...newExperience[jobIndex].bullets];
      newBullets[bulletIndex] = value;
      newExperience[jobIndex] = { ...newExperience[jobIndex], bullets: newBullets };
      return { ...prev, experience: newExperience };
    });
    setHasChanges(true);
  };

  // Add a new bullet point to a job
  const addBullet = (jobIndex) => {
    setEditedData(prev => {
      const newExperience = [...prev.experience];
      const newBullets = [...(newExperience[jobIndex].bullets || []), ""];
      newExperience[jobIndex] = { ...newExperience[jobIndex], bullets: newBullets };
      return { ...prev, experience: newExperience };
    });
    setHasChanges(true);
  };

  // Remove a bullet point from a job
  const removeBullet = (jobIndex, bulletIndex) => {
    setEditedData(prev => {
      const newExperience = [...prev.experience];
      const newBullets = [...newExperience[jobIndex].bullets];
      newBullets.splice(bulletIndex, 1);
      newExperience[jobIndex] = { ...newExperience[jobIndex], bullets: newBullets };
      return { ...prev, experience: newExperience };
    });
    setHasChanges(true);
  };

  // Add a new item to an array section (experience, education, etc.)
  const addArrayItem = (section, template) => {
    setEditedData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), template]
    }));
    setHasChanges(true);
  };

  // Remove an item from an array section
  const removeArrayItem = (section, index) => {
    setEditedData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  // Move an item up or down in an array section
  const moveArrayItem = (section, index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === editedData[section].length - 1)
    ) {
      return; // Can't move further
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setEditedData(prev => {
      const newArray = [...prev[section]];
      const item = newArray[index];
      newArray.splice(index, 1);
      newArray.splice(newIndex, 0, item);
      return { ...prev, [section]: newArray };
    });
    setHasChanges(true);
  };

  // Basic field validation
  const validateField = (section, field, value) => {
    const key = field ? `${section}.${field}` : section;
    let error = null;

    // Check for required fields
    if (value === '') {
      if (
        (section === 'contactInfo' && ['name', 'email'].includes(field)) ||
        (section === 'summaryOrObjective')
      ) {
        error = 'This field is required';
      }
    }

    // Email validation
    if (section === 'contactInfo' && field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [key]: error
    }));

    return !error;
  };

  // Save changes
  const handleSave = () => {
    // Validate all fields before saving
    let isValid = true;
    
    // Validate contact info
    ['name', 'email'].forEach(field => {
      if (!validateField('contactInfo', field, editedData.contactInfo[field])) {
        isValid = false;
      }
    });
    
    // Validate summary
    if (!validateField('summaryOrObjective', null, editedData.summaryOrObjective)) {
      isValid = false;
    }
    
    if (isValid) {
      onSave(editedData);
      setHasChanges(false);
    }
  };

  // Render editable contact info section
  const renderContactInfo = () => {
    const { contactInfo } = editedData;
    if (!contactInfo) return null;

    return (
      <div className="section contact-info">
        {isEditMode ? (
          <div className="edit-section">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={contactInfo.name || ''}
                onChange={(e) => handleTextChange('contactInfo', 'name', e.target.value)}
                className={validationErrors['contactInfo.name'] ? 'error' : ''}
              />
              {validationErrors['contactInfo.name'] && (
                <div className="error-message">{validationErrors['contactInfo.name']}</div>
              )}
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={contactInfo.location || ''}
                onChange={(e) => handleTextChange('contactInfo', 'location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={contactInfo.email || ''}
                onChange={(e) => handleTextChange('contactInfo', 'email', e.target.value)}
                className={validationErrors['contactInfo.email'] ? 'error' : ''}
              />
              {validationErrors['contactInfo.email'] && (
                <div className="error-message">{validationErrors['contactInfo.email']}</div>
              )}
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                value={contactInfo.phone || ''}
                onChange={(e) => handleTextChange('contactInfo', 'phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LinkedIn:</label>
              <input
                type="url"
                value={contactInfo.linkedin || ''}
                onChange={(e) => handleTextChange('contactInfo', 'linkedin', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <h1>{contactInfo.name || 'Resume'}</h1>
            <p>
              {contactInfo.location && <span style={{marginRight: '10px'}}>{contactInfo.location}</span>}
              {contactInfo.phone && <span style={{marginRight: '10px'}}> | {contactInfo.phone}</span>}
              {contactInfo.email && <span> | <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></span>}
              {contactInfo.linkedin && <span> | <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>}
            </p>
          </>
        )}
      </div>
    );
  };

  // Render editable summary section
  const renderSummary = () => {
    if (!editedData.summaryOrObjective) return null;

    return (
      <div className="section">
        <h2>Summary / Objective</h2>
        {isEditMode ? (
          <div className="edit-section">
            <div className="form-group">
              <textarea
                value={editedData.summaryOrObjective}
                onChange={(e) => handleTextChange('summaryOrObjective', null, e.target.value)}
                rows="4"
                className={validationErrors['summaryOrObjective'] ? 'error' : ''}
              />
              {validationErrors['summaryOrObjective'] && (
                <div className="error-message">{validationErrors['summaryOrObjective']}</div>
              )}
            </div>
          </div>
        ) : (
          <p>{editedData.summaryOrObjective}</p>
        )}
      </div>
    );
  };

  // Render editable experience section
  const renderExperience = () => {
    if (!editedData.experience || editedData.experience.length === 0) return null;

    return (
      <div className="section">
        <h2>Professional Experience</h2>
        {isEditMode && (
          <button 
            className="add-button"
            onClick={() => addArrayItem('experience', {
              title: 'New Position',
              company: 'Company Name',
              location: 'Location',
              dates: 'Start Date - End Date',
              bullets: ['Responsibility or achievement']
            })}
          >
            + Add Position
          </button>
        )}
        {editedData.experience.map((job, jobIndex) => (
          <div className="job" key={jobIndex}>
            {isEditMode ? (
              <div className="edit-section">
                <div className="section-controls">
                  <button onClick={() => moveArrayItem('experience', jobIndex, 'up')} disabled={jobIndex === 0}>↑</button>
                  <button onClick={() => moveArrayItem('experience', jobIndex, 'down')} disabled={jobIndex === editedData.experience.length - 1}>↓</button>
                  <button onClick={() => removeArrayItem('experience', jobIndex)}>Delete</button>
                </div>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={job.title || ''}
                    onChange={(e) => handleArrayItemChange('experience', jobIndex, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Company:</label>
                  <input
                    type="text"
                    value={job.company || ''}
                    onChange={(e) => handleArrayItemChange('experience', jobIndex, 'company', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Location:</label>
                  <input
                    type="text"
                    value={job.location || ''}
                    onChange={(e) => handleArrayItemChange('experience', jobIndex, 'location', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Dates:</label>
                  <input
                    type="text"
                    value={job.dates || ''}
                    onChange={(e) => handleArrayItemChange('experience', jobIndex, 'dates', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Responsibilities & Achievements:</label>
                  {job.bullets && job.bullets.map((bullet, bulletIndex) => (
                    <div className="bullet-edit" key={bulletIndex}>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleBulletChange(jobIndex, bulletIndex, e.target.value)}
                        rows="2"
                      />
                      <button onClick={() => removeBullet(jobIndex, bulletIndex)}>Remove</button>
                    </div>
                  ))}
                  <button onClick={() => addBullet(jobIndex)}>+ Add Bullet</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{job.title}</h3>
                <p style={{margin: 0, fontStyle: 'italic'}}>{job.company} | {job.location} | {job.dates}</p>
                {job.bullets && job.bullets.length > 0 && (
                  <ul>
                    {job.bullets.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render editable education section
  const renderEducation = () => {
    if (!editedData.education || editedData.education.length === 0) return null;

    return (
      <div className="section">
        <h2>Education</h2>
        {isEditMode && (
          <button 
            className="add-button"
            onClick={() => addArrayItem('education', {
              degree: 'Degree',
              major: 'Major',
              institution: 'Institution Name',
              graduationYear: 'Year',
              details: ''
            })}
          >
            + Add Education
          </button>
        )}
        {editedData.education.map((edu, eduIndex) => (
          <div className="degree" key={eduIndex}>
            {isEditMode ? (
              <div className="edit-section">
                <div className="section-controls">
                  <button onClick={() => moveArrayItem('education', eduIndex, 'up')} disabled={eduIndex === 0}>↑</button>
                  <button onClick={() => moveArrayItem('education', eduIndex, 'down')} disabled={eduIndex === editedData.education.length - 1}>↓</button>
                  <button onClick={() => removeArrayItem('education', eduIndex)}>Delete</button>
                </div>
                <div className="form-group">
                  <label>Degree:</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleArrayItemChange('education', eduIndex, 'degree', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Major:</label>
                  <input
                    type="text"
                    value={edu.major || ''}
                    onChange={(e) => handleArrayItemChange('education', eduIndex, 'major', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Institution:</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleArrayItemChange('education', eduIndex, 'institution', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Graduation Year:</label>
                  <input
                    type="text"
                    value={edu.graduationYear || ''}
                    onChange={(e) => handleArrayItemChange('education', eduIndex, 'graduationYear', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Details (Optional):</label>
                  <textarea
                    value={edu.details || ''}
                    onChange={(e) => handleArrayItemChange('education', eduIndex, 'details', e.target.value)}
                    rows="2"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3>{edu.degree}, {edu.major}</h3>
                <p style={{margin: 0}}>{edu.institution} - {edu.graduationYear}</p>
                {edu.details && <p style={{margin: 0, fontSize: '0.9em'}}>{edu.details}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render editable skills section
  const renderSkills = () => {
    if (!editedData.skills || Object.keys(editedData.skills).length === 0) return null;

    return (
      <div className="section skills-section">
        <h2>Skills</h2>
        {isEditMode ? (
          <div className="edit-section">
            {Object.entries(editedData.skills).map(([category, skillsList], categoryIndex) => (
              <div key={categoryIndex} className="skills-category-edit">
                <div className="form-group">
                  <label>Category:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => {
                      const newSkills = { ...editedData.skills };
                      const skills = newSkills[category];
                      delete newSkills[category];
                      newSkills[e.target.value] = skills;
                      setEditedData(prev => ({ ...prev, skills: newSkills }));
                    }}
                  />
                  <button onClick={() => {
                    const newSkills = { ...editedData.skills };
                    delete newSkills[category];
                    setEditedData(prev => ({ ...prev, skills: newSkills }));
                  }}>
                    Remove Category
                  </button>
                </div>
                <div className="form-group">
                  <label>Skills (comma-separated):</label>
                  <textarea
                    value={skillsList.join(', ')}
                    onChange={(e) => {
                      const newSkillsList = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                      const newSkills = { ...editedData.skills, [category]: newSkillsList };
                      setEditedData(prev => ({ ...prev, skills: newSkills }));
                    }}
                    rows="2"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newCategory = 'New Category';
                const newSkills = { ...editedData.skills, [newCategory]: ['Skill 1', 'Skill 2'] };
                setEditedData(prev => ({ ...prev, skills: newSkills }));
              }}
            >
              + Add Skill Category
            </button>
          </div>
        ) : (
          <>
            {Object.entries(editedData.skills).map(([category, skillsList], categoryIndex) => (
              <div key={categoryIndex} className="skills-category">
                <h3 style={{textTransform: 'capitalize'}}>{category}</h3>
                <ul>
                  {skillsList.map((skill, skillIndex) => (
                    <li key={skillIndex}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`editable-resume ${isEditMode ? 'edit-mode' : ''}`}>
      {isEditMode && (
        <div className="edit-mode-banner">
          <p>You are in edit mode. Make your changes and click "Save Changes" when done.</p>
        </div>
      )}
      {renderContactInfo()}
      {renderSummary()}
      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
      
      {isEditMode && (
        <div className="edit-controls">
          <button 
            className={`save-button ${hasChanges ? 'has-changes' : ''}`} 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save Changes' : 'No Changes to Save'}
          </button>
        </div>
      )}
    </div>
  );
};

EditableResume.propTypes = {
  resumeData: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default EditableResume;
