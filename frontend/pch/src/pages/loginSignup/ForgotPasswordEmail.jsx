import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import EmailIcon from '@mui/icons-material/Email';
import AuthLayout from '../../components/auth/AuthLayout';
import './LoginSignUp.css';

const ForgotPasswordEmail = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            toast.success('If the email exists, an OTP will be sent to it.', { autoClose: 5000 });
            // Redirect to the OTP verification screen and pass the email string via state
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data || 'Failed to request password reset. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password?"
            description="Enter the email address associated with your account, and we'll send you a 6-digit OTP to reset your password."
        >
            <div className="header">
                <div className="text">Reset Password</div>
                <div className="underline"></div>
            </div>

            <div className="inputs">
                {error && <div className="auth-error-text" style={{ textAlign: "center", marginBottom: "15px", marginTop: "0" }}>{error}</div>}

                <div className="input">
                    <EmailIcon className="login-icon" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    className="btn btn-teal submit-btn"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                </button>

                <div className="switch-auth">
                    Remember your password?
                    <Link to="/login"><span> Login</span></Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPasswordEmail;
