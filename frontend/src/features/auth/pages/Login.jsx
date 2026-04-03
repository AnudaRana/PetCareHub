import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessLayout from "../components/AccessLayout";
import { useAuth } from "../contexts/AuthContext";
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

      <form className="inputs" onSubmit={handleLogin}>
        {error && <div className="auth-error-text">{error}</div>}
        <div className="input">
          <EmailIcon className="login-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="password-toggle-container" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <VisibilityIcon className="login-icon" />
            ) : (
              <VisibilityOffIcon className="login-icon" />
            )}
          </div>
        </div>

        <Link to="/forgot-password" name="forgot" className="forgot-password">Forgot Password?</Link>

        <button className="btn btn-teal submit-btn" type="submit">
          Login
        </button>

        <div className="switch-auth">
          New here?
          <Link to="/signup">
            <span> Sign Up</span>
          </Link>
        </div>
      </form>
    </AccessLayout>
  );
};

export default Login;
