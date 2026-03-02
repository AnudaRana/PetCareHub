// src/pages/loginSignup/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./LoginSignUp.css";

const ResetPassword = () => {
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Optional: very basic client-side check
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        password,
        confirmPassword // optional – backend may ignore it
      }, {
        params: { token }  // send token as query param
      });

      setMessage(response.data || 'Password has been reset successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message 
        || 'Failed to reset password. The link may be invalid or expired.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      description="Choose a strong password for your account."
    >
      <div className="header">
        <div className="text">New Password</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {!tokenValid || error ? (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            {error || 'Invalid reset link. Please request a new one.'}
          </div>
        ) : (
          <>
            {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{message}</div>}

            <div className="input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword ? (
                <VisibilityIcon className="login-icon password-toggle" onClick={() => setShowPassword(false)} />
              ) : (
                <VisibilityOffIcon className="login-icon password-toggle" onClick={() => setShowPassword(true)} />
              )}
            </div>

            <div className="input">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {showConfirm ? (
                <VisibilityIcon className="login-icon password-toggle" onClick={() => setShowConfirm(false)} />
              ) : (
                <VisibilityOffIcon className="login-icon password-toggle" onClick={() => setShowConfirm(true)} />
              )}
            </div>

            <button 
              className="btn btn-teal submit-btn" 
              onClick={handleSubmit}
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        <div className="switch-auth">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;