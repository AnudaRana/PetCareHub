import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PasswordResetLayout from '../components/PasswordResetLayout';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) setError('Invalid or missing reset token.');
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { password }, { params: { token } });
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Session expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PasswordResetLayout
            title="New Password"
            description="Choose a strong password for your account."
            error={error}
        >
            <div className="input">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityIcon className="login-icon" /> : <VisibilityOffIcon className="login-icon" />}
                </div>
            </div>
            <div className="input">
                <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <VisibilityIcon className="login-icon" /> : <VisibilityOffIcon className="login-icon" />}
                </div>
            </div>
            <button className="btn btn-teal submit-btn" onClick={handleSubmit} disabled={loading || !password || !confirmPassword}>
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="switch-auth">
                <Link to="/login"><span>Back to Login</span></Link>
            </div>
        </PasswordResetLayout>
    );
};

export default ResetPassword;