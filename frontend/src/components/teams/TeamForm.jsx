import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../forms/InputField';

const TeamForm = ({ type = 'create', onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    joinCode: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (type === 'create') {
      if (!formData.teamName.trim()) {
        newErrors.teamName = 'Team name is required';
      } else if (formData.teamName.length < 3) {
        newErrors.teamName = 'Team name must be at least 3 characters';
      } else if (formData.teamName.length > 50) {
        newErrors.teamName = 'Team name must be less than 50 characters';
      }
    } else if (type === 'join') {
      if (!formData.joinCode.trim()) {
        newErrors.joinCode = 'Join code is required';
      } else if (formData.joinCode.length !== 6) {
        newErrors.joinCode = 'Join code must be 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (type === 'create') {
      onSubmit(formData.teamName);
    } else {
      onSubmit(formData.joinCode);
    }

    // Reset form after submission
    setFormData({ teamName: '', joinCode: '' });
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {type === 'create' ? 'Create Team' : 'Join Team'}
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        {type === 'create' 
          ? 'Create a new team and invite others to join using the generated code'
          : 'Enter the 6-character code provided by your team leader'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'create' ? (
          <InputField
            label="Team Name"
            name="teamName"
            type="text"
            value={formData.teamName}
            onChange={handleChange}
            placeholder="Enter team name"
            required
            disabled={loading}
            error={errors.teamName}
            helperText="Choose a unique name for your team"
          />
        ) : (
          <InputField
            label="Join Code"
            name="joinCode"
            type="text"
            value={formData.joinCode}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().slice(0, 6);
              handleChange({ target: { name: 'joinCode', value } });
            }}
            placeholder="XXXXXX"
            required
            disabled={loading}
            error={errors.joinCode}
            helperText="Ask your team leader for the 6-character code"
          />
        )}
        
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading 
            ? (type === 'create' ? 'Creating...' : 'Joining...') 
            : (type === 'create' ? 'Create Team' : 'Join Team')}
        </Button>
      </form>
    </Card>
  );
};

export default TeamForm;
