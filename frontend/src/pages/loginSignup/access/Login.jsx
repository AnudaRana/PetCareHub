import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessLayout from "./AccessLayout.jsx";
import { useAuth } from "../../../context/AuthContext";
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
    setError('');
    try {
      const roles = await login(email, password);
      toast.success("Login successful!");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Invalid credentials");
    }
  };

  return (
    <AccessLayout
      title="Welcome Back!"
      description="Login to access your account and manage your pet's health records."
    >
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {error && <div className="auth-error-text">{error}</div>}
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

          <div className="password-toggle-wrapper" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
            <VisibilityIcon className="login-icon" />
            ) : (
            <VisibilityOffIcon className="login-icon" />
            )}
          </div>
        </div>

        <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>

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
    </AccessLayout>
  );
};

export default Login;
