import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSuccess = (credentialResponse) => {
    setErrorMessage(''); // Clear any previous error
    onLoginSuccess(credentialResponse);
  };

  const handleLoginFailure = () => {
    setErrorMessage('Authentication failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome to StudyTrack</h1>
        <p className="login-subtitle">Your personalized study assistant</p>
        {errorMessage && <p className="login-error">{errorMessage}</p>}
        <div className="login-button">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
