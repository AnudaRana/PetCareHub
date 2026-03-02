// src/pages/loginSignup/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout.jsx'; // assuming you have this
import { useNavigate } from 'react-router-dom';
import "./LoginSignUp.css"; // if you want consistent styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // You can pass just { email } or { email } as object – both work
      const response = await axios.post('/api/auth/forgot-password', { email });

      setMessage(response.data || 'Reset link sent to your email. Check your inbox (and spam folder).');
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      const errMsg = err.response?.data?.message 
        || err.response?.data 
        || 'Failed to send reset email. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email and we'll send you a link to reset your password."
    >
      <div className="header">
        <div className="text">Reset Password</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {message && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{message}</div>}
        {error   && <div className="error-message"   style={{ color: 'red',   textAlign: 'center' }}>{error}</div>}

        <div className="input">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />
        </div>

        <button 
          className="btn btn-teal submit-btn" 
          onClick={handleSubmit}
          disabled={loading || !email}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="switch-auth">
          Remember your password? 
          <a href="/login" style={{ marginLeft: '8px' }}>Login</a>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;