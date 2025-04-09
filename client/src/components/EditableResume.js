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
    // Create a new object to ensure React detects the state change
    const newData = {...editedData};
    
    if (field) {
      // For nested fields like contactInfo.phone
      if (!newData[section]) {
        newData[section] = {};
      }
      newData[section][field] = value;
    } else {
      // For direct fields like summaryOrObjective
      newData[section] = value;
    }
    
    // Update state with the new object
    setEditedData(newData);
    setHasChanges(true);
    
    // Basic validation
    validateField(section, field, value);
  };

  // Handle changes for nested array items
  const handleArrayItemChange = (section, index, field, value) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the section exists
    if (!newData[section]) {
      newData[section] = [];
    }
    
    // Ensure the item at this index exists
    if (!newData[section][index]) {
      newData[section][index] = {};
    }
    
    // Special handling for education graduation year
    if (section === 'education' && field === 'graduationYear') {
      console.log(`Updating education[${index}].graduationYear from "${newData[section][index][field]}" to "${value}"`);
      
      // If the current value is "Extracted from resume", we need special handling
      if (newData[section][index][field] === "Extracted from resume") {
        console.log(`Field was "Extracted from resume", storing edited value`);
      }
    }
    
    // Update the specific field
    newData[section][index][field] = value;
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Add a new item to an array section (experience, education, etc.)
  const addArrayItem = (section, template) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the section exists
    if (!newData[section]) {
      newData[section] = [];
    }
    
    // Add the new item
    newData[section].push(template);
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Remove an item from an array section
  const removeArrayItem = (section, index) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the section exists
    if (!newData[section] || !Array.isArray(newData[section])) {
      return; // Nothing to remove
    }
    
    // Remove the item at the specified index
    newData[section].splice(index, 1);
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Move an item up or down in an array section
  const moveArrayItem = (section, index, direction) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the section exists
    if (!newData[section] || !Array.isArray(newData[section])) {
      return; // Nothing to move
    }
    
    // Check if move is valid
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === newData[section].length - 1)
    ) {
      return; // Can't move further
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the items
    const temp = newData[section][index];
    newData[section][index] = newData[section][newIndex];
    newData[section][newIndex] = temp;
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Handle changes for bullets in experience section
  const handleBulletChange = (jobIndex, bulletIndex, value) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the experience section and job exist
    if (!newData.experience || !newData.experience[jobIndex]) {
      return;
    }
    
    // Ensure bullets array exists
    if (!newData.experience[jobIndex].bullets) {
      newData.experience[jobIndex].bullets = [];
    }
    
    // Update the specific bullet
    newData.experience[jobIndex].bullets[bulletIndex] = value;
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Add a new bullet point to a job
  const addBullet = (jobIndex) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the experience section and job exist
    if (!newData.experience || !newData.experience[jobIndex]) {
      return;
    }
    
    // Ensure bullets array exists
    if (!newData.experience[jobIndex].bullets) {
      newData.experience[jobIndex].bullets = [];
    }
    
    // Add a new empty bullet
    newData.experience[jobIndex].bullets.push("");
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Remove a bullet point from a job
  const removeBullet = (jobIndex, bulletIndex) => {
    // Create a deep copy of the current state
    const newData = JSON.parse(JSON.stringify(editedData));
    
    // Ensure the experience section, job, and bullets exist
    if (
      !newData.experience || 
      !newData.experience[jobIndex] || 
      !newData.experience[jobIndex].bullets ||
      !Array.isArray(newData.experience[jobIndex].bullets)
    ) {
      return;
    }
    
    // Remove the bullet at the specified index
    newData.experience[jobIndex].bullets.splice(bulletIndex, 1);
    
    // Update the state with the new object
    setEditedData(newData);
    setHasChanges(true);
  };

  // Basic field validation
  const validateField = (section, field, value) => {
    const key = field ? `${section}.${field}` : section;
    let error = null;

    // Handle undefined or null values
    const actualValue = value === undefined || value === null ? '' : value;

    // Check for required fields
    if (actualValue === '') {
      if (
        (section === 'contactInfo' && ['name', 'email'].includes(field)) ||
        (section === 'summaryOrObjective')
      ) {
        error = 'This field is required';
      }
    }

    // Email validation
    if (section === 'contactInfo' && field === 'email' && actualValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(actualValue)) {
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
    console.log('EditableResume: handleSave called');
    
    // Process the data before saving to ensure all edits are properly applied
    const processedData = JSON.parse(JSON.stringify(editedData));
    
    // Process education data to handle "Extracted from resume" values
    if (processedData.education && processedData.education.length > 0) {
      console.log('Education data before processing:', JSON.stringify(processedData.education, null, 2));
      
      // No special processing needed here - we're directly updating the values in handleArrayItemChange
    }
    
    // Validate all fields before saving
    let isValid = true;
    
    // Ensure contactInfo exists
    if (!processedData.contactInfo) {
      processedData.contactInfo = {};
      isValid = false;
    }
    
    // Validate contact info
    ['name', 'email'].forEach(field => {
      if (!validateField('contactInfo', field, processedData.contactInfo[field])) {
        isValid = false;
      }
    });
    
    // Validate summary
    if (!validateField('summaryOrObjective', null, processedData.summaryOrObjective)) {
      isValid = false;
    }
    
    if (isValid) {
      console.log('EditableResume: Validation passed, saving data');
      console.log('Final data being saved:', JSON.stringify(processedData, null, 2));
      
      // Pass the processed data to the parent component
      onSave(processedData);
      setHasChanges(false);
    } else {
      console.error('EditableResume: Validation failed, not saving');
      alert('Please fix the validation errors before saving.');
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

  // Render editable projects section
  const renderProjects = () => {
    if (!editedData.projects || editedData.projects.length === 0) return null;

    return (
      <div className="section">
        <h2>Projects</h2>
        {isEditMode && (
          <button 
            className="add-button"
            onClick={() => addArrayItem('projects', {
              name: 'Project Name',
              description: 'Project Description',
              bullets: ['Key feature or achievement']
            })}
          >
            + Add Project
          </button>
        )}
        {editedData.projects.map((project, projectIndex) => (
          <div key={projectIndex} className="item">
            {isEditMode ? (
              <div className="edit-section">
                <div className="form-group">
                  <label>Project Name:</label>
                  <input
                    type="text"
                    value={project.name || ''}
                    onChange={(e) => handleArrayItemChange('projects', projectIndex, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => handleArrayItemChange('projects', projectIndex, 'description', e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Key Points:</label>
                  {project.bullets && project.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="bullet-edit">
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const newData = JSON.parse(JSON.stringify(editedData));
                          if (!newData.projects[projectIndex].bullets) {
                            newData.projects[projectIndex].bullets = [];
                          }
                          newData.projects[projectIndex].bullets[bulletIndex] = e.target.value;
                          setEditedData(newData);
                          setHasChanges(true);
                        }}
                        rows="2"
                      />
                      <button onClick={() => {
                        const newData = JSON.parse(JSON.stringify(editedData));
                        newData.projects[projectIndex].bullets.splice(bulletIndex, 1);
                        setEditedData(newData);
                        setHasChanges(true);
                      }}>Remove</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const newData = JSON.parse(JSON.stringify(editedData));
                    if (!newData.projects[projectIndex].bullets) {
                      newData.projects[projectIndex].bullets = [];
                    }
                    newData.projects[projectIndex].bullets.push('');
                    setEditedData(newData);
                    setHasChanges(true);
                  }}>+ Add Key Point</button>
                </div>
                <div className="item-actions">
                  {projectIndex > 0 && (
                    <button onClick={() => moveArrayItem('projects', projectIndex, 'up')}>Move Up</button>
                  )}
                  {projectIndex < editedData.projects.length - 1 && (
                    <button onClick={() => moveArrayItem('projects', projectIndex, 'down')}>Move Down</button>
                  )}
                  <button onClick={() => removeArrayItem('projects', projectIndex)}>Remove Project</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{project.name}</h3>
                <p style={{margin: '5px 0'}}>{project.description}</p>
                {project.bullets && project.bullets.length > 0 && (
                  <ul>
                    {project.bullets.map((point, index) => (
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
      {renderProjects()}
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
