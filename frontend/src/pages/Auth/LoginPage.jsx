import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from "../../components/common/Toast";
import { FullScreenAuth } from "../../components/ui/FullScreenAuth";
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        showToast('Login successful!', 'success');
        
        setTimeout(() => {
          const userRole = result.user?.role;
          
          if (userRole === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (userRole === 'participant') {
            navigate('/participant/events', { replace: true });
          } else {
            console.warn('User role not found, defaulting to participant');
            navigate('/participant/events', { replace: true });
          }
        }, 1000);
      } else {
        showToast(result.error || 'Login failed', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An unexpected error occurred', 'error');
      setLoading(false);
    }
  };

  return (
    <>
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <FullScreenAuth
        mode="login"
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
        errors={errors}
        loading={loading}
      />
    </>
  );
};

export default LoginPage;
