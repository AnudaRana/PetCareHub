import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext";
import "./LoginSignUp.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const roles = await login(email, password);
        navigate('/dashboard');
    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      description="We're so happy to see you again. Login to access your account and manage your pet's health records."
    >
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
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

        <div className="forgot-password">Forgot Password?</div>

        <button className="btn btn-teal submit-btn" onClick={handleLogin}>
          Login
        </button>

        <div className="switch-auth">
          New here?
          <Link to="/signup">
            <span> Sign Up</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
