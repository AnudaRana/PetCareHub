import React from "react";
import Logo from "../../../assets/logo-w.png";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import "./AccessLayout.css";

const AccessLayout = ({ children, title, description }) => {
  return (
    <div className="login-page">
      <div className="login-container">


        <div className="login-left">
          <Link to="/" className="back-to-home">
            <KeyboardDoubleArrowLeftIcon/> <HomeIcon/> 
          </Link>
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

export default AccessLayout;