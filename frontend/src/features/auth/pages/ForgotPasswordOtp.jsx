import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import KeyIcon from '@mui/icons-material/Key';
import PasswordResetLayout from '../components/PasswordResetLayout';

const ForgotPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter a 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      toast.success('OTP Verified!');
      navigate(`/reset?token=${response.data}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PasswordResetLayout
      title="Enter OTP"
      description={`We sent a 6-digit code to ${email}. Please enter it below.`}
      error={error}
    >
      <form onSubmit={handleVerify}>
        <div className="input">
          <KeyIcon className="login-icon" />
          <input
            type="text"
            name="otp"
            autoComplete="one-time-code"
            placeholder="6-Digit OTP"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="btn btn-teal submit-btn" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <div className="switch-auth">
        Didn't receive it? <Link to="/forgot-password" replace><span> Resend OTP</span></Link>
      </div>
    </PasswordResetLayout>
  );
};

export default ForgotPasswordOtp;