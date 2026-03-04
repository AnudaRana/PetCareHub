import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import KeyIcon from '@mui/icons-material/Key';
import PasswordResetLayout from './PasswordResetLayout';

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
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', { email, otp });
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
            <div className="input">
                <KeyIcon className="login-icon" />
                <input
                    type="text"
                    placeholder="6-Digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                />
            </div>
            <button className="btn btn-teal submit-btn" onClick={handleVerify} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="switch-auth">
                Didn't receive it? <Link to="/forgot-password" replace><span> Resend OTP</span></Link>
            </div>
        </PasswordResetLayout>
    );
};

export default ForgotPasswordOtp;