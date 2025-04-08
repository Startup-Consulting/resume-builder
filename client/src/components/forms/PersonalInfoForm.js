import React from 'react';

const PersonalInfoForm = ({ personalInfo, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...personalInfo, [name]: value });
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Personal Information</h3>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="firstName"
              id="firstName"
              className="input"
              value={personalInfo.firstName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="lastName"
              id="lastName"
              className="input"
              value={personalInfo.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              value={personalInfo.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              className="input"
              value={personalInfo.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street address
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="address"
              id="address"
              className="input"
              value={personalInfo.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="city"
              id="city"
              className="input"
              value={personalInfo.city}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="state"
              id="state"
              className="input"
              value={personalInfo.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP / Postal code
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="zipCode"
              id="zipCode"
              className="input"
              value={personalInfo.zipCode}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="sm:col-span-3">
          <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">
            LinkedIn Profile URL
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="linkedIn"
              id="linkedIn"
              className="input"
              value={personalInfo.linkedIn}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Personal Website/Portfolio URL
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="website"
              id="website"
              className="input"
              value={personalInfo.website}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
