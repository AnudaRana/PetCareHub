import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { devLogin } from './utils/devLogin';
window.devLogin = devLogin;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
