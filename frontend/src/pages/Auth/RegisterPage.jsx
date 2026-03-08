import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Toast from "../../components/common/Toast";
import { registerUser } from "../../services/authApi";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant'
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        showToast('Account created successfully', 'success');
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        showToast(result.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your EventNexus account
          </h1>
          <p className="text-gray-600">
            Join EventNexus to manage and participate in events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="participant">Participant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
