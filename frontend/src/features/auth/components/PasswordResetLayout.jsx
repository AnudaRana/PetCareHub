import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import '../pages/PasswordReset.css';

const PasswordResetLayout = ({ children, title, description, error }) => {
    return (
        <div className="reset-page">
            <div className="reset-container">
                <Link to="/" className="back-to-home">
                    <KeyboardDoubleArrowLeftIcon style={{ fontSize: '18px' }} />
                    <HomeIcon style={{ fontSize: '20px' }} /> 
                </Link>

                <div className="header">
                    <div className="text">{title}</div>
                    <div className="underline"></div>
                </div>

                <p className="description-text">{description}</p>

                <div className="inputs">
                    {error && <div className="auth-error-text">{error}</div>}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PasswordResetLayout;