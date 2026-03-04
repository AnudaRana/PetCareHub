// src/pages/loginSignup/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./LoginSignUp.css";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
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
      // Send the token as a query param, matching backend `request.get("password")` + `@RequestParam token`
      await axios.post('http://localhost:8080/api/auth/reset-password',
        { password },
        { params: { token } }
      );

      toast.success('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data || 'Failed to reset password. The session may have expired.';
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
          <div className="auth-error-text" style={{ textAlign: "center", marginBottom: "15px", marginTop: "0" }}>
            {error || 'Invalid reset link. Please request a new one.'}
          </div>
        ) : null}

        {tokenValid && (
          <>

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
          <Link to="/login"><span>Back to Login</span></Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;