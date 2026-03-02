import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext"; // Import the custom hook
import "./LoginSignUp.css";

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth(); // Destructure register from context

    // State management
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState(''); // Added address state
    const [showPassword, setShowPassword] = useState(false); // Fix: Added missing state
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(''); 
        try {
            // Match the object keys to what your Java Backend (User entity) expects
            await register({ firstName, lastName, email, password, mobileNumber, address });
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };
  
  return (
    <AuthLayout
      title="Join Us!"
      description="Create your account to start managing your pet's health records easily."
    >
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {error && <div className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</div>}

        <div className="input">
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
          />
        </div>

        <div className="input">
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
          />
        </div>

        <div className="input">
          <EmailIcon className="login-icon" />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="input">
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={mobileNumber} 
            onChange={(e) => setMobileNumber(e.target.value)} 
          />
        </div>

        <div className="input">
          <input 
            type="text" 
            placeholder="Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
          />
        </div>

        <div className="input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <VisibilityIcon
              className="login-icon password-toggle"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <VisibilityOffIcon
              className="login-icon password-toggle"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        <button className="btn btn-teal submit-btn" onClick={handleSignUp}>
           Sign Up
        </button>

        <div className="switch-auth">
          Already have an account?
          <Link to="/login"> <span>Login </span></Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
