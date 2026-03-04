import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import KeyIcon from '@mui/icons-material/Key';
import AuthLayout from '../../components/auth/AuthLayout';
import './LoginSignUp.css';

const ForgotPasswordOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Read the email passed from the previous step
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect back if navigating directly to this page without an email state
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', { email, otp });
            // The backend returns a temporary UUID token in the response text we need for the next step.
            const tempToken = response.data;
            toast.success('OTP Verified!');
            navigate(`/reset?token=${tempToken}`);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Verify OTP"
            description={`We sent a 6-digit code to ${email}. Please enter it below.`}
        >
            <div className="header">
                <div className="text">Enter OTP</div>
                <div className="underline"></div>
            </div>

            <div className="inputs">
                {error && <div className="auth-error-text" style={{ textAlign: "center", marginBottom: "15px", marginTop: "0" }}>{error}</div>}

                <div className="input">
                    <KeyIcon className="login-icon" />
                    <input
                        type="text"
                        placeholder="6-Digit OTP"
                        value={otp}
                        maxLength={6}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                        disabled={isLoading}
                    />
                </div>

                <button
                    className="btn btn-teal submit-btn"
                    onClick={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="switch-auth">
                    Didn't receive it?
                    <Link to="/forgot-password" replace><span> Resend OTP</span></Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPasswordOtp;
