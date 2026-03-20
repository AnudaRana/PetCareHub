import React from "react";
import Logo from "../../assets/logo-w.png";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import "./AuthLayout.css";

const AuthLayout = ({ children, title, description }) => {
  return (
    <div className="login-page">
      <div className="login-container">


        <div className="login-left">
          <img src={Logo} alt="Logo" />
          <h2>{title}</h2>
          <p>{description}</p>
        </div>


        <div className="login-right">
          <Link to="/" className="back-to-home" style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#00796b', fontWeight: 'bold' }}>
            <HomeIcon /> Home
          </Link>
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;