import React from "react";
import Logo from "../../assets/logo-w.png";
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
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;