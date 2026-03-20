import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import EmailIcon from '@mui/icons-material/Email';
import PasswordResetLayout from './PasswordResetLayout';

const ForgotPasswordEmail = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) { setError('Please enter your email address'); return; }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            toast.success('OTP sent');
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request reset.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PasswordResetLayout
            title="Verify Email"
            description="Enter your email address to receive a 6-digit OTP to reset your password."
            error={error}
        >
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
            <button className="btn btn-teal submit-btn" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
            <div className="switch-auth">
                Remember your password? <Link to="/login"><span> Login</span></Link>
            </div>
        </PasswordResetLayout>
    );
};

export default ForgotPasswordEmail;