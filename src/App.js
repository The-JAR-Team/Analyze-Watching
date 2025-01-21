import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import SessionForm from './components/pages/SessionForm';
import Summary from './components/Summary';
//import EyeDebugger from './components/EyeDebugger';
import Login from './components/pages/Login';
import HomePage from './components/pages/HomePage';

function App() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [mode, setMode] = useState('analyze');
  const [sessionData, setSessionData] = useState(null);
  const [lectureInfo, setLectureInfo] = useState({});
  const [userInfo, setUserInfo] = useState(null); // Holds Google user info
  const [showSessionForm, setShowSessionForm] = useState(false); // Toggle between homepage and session form

  const handleStartSession = (lecture, user, selectedMode) => {
    console.log('Session started with lecture:', lecture, 'user:', user, 'mode:', selectedMode);
    setLectureInfo(lecture);
    setUserInfo(user);
    setMode(selectedMode);
    setSessionStarted(true);
    setSessionPaused(false);
    setSessionEnded(false);
    setSessionData(null);
  };

  const handlePauseSession = () => {
    console.log('Session paused/resumed');
    setSessionPaused(!sessionPaused);
  };

  const handleEndSession = () => {
    console.log('Ending session...');
    setSessionEnded(true);
  };

  const handleSessionData = (data) => {
    console.log('Received session data:', data);
    setSessionData(data);
  };

  const handleRestartSession = () => {
    console.log('Restarting session...');
    setSessionStarted(false);
    setSessionEnded(false);
    setSessionData(null);
    setLectureInfo({});
    setMode('analyze');
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      console.log('Google Login Successful. Token:', token);

      // Send the token to the server
      console.log(`${process.env.REACT_APP_SERVER_URL}/login`)
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Server Response:', data);

        // Handle the data returned by the server
        setUserInfo(data.user);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      alert('Login failed. Please try again.');
    }
  };

  const handleLoginFailure = () => {
    console.error('Google Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        {!userInfo ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onLoginFailure={handleLoginFailure}
          />
        ) : showSessionForm ? (
          <SessionForm
            onStartSession={(lecture, user, mode) => {
              handleStartSession(lecture, user, mode);
              setShowSessionForm(false); // Return to the homepage after starting a session
            }}
          />
        ) : sessionStarted ? (
          <>
            <VideoPlayer
              mode={mode}
              sessionPaused={sessionPaused}
              sessionEnded={sessionEnded}
              onSessionData={handleSessionData}
              lectureInfo={lectureInfo}
              userInfo={userInfo}
            />
            {!sessionEnded && (
              <Controls
                onPauseSession={handlePauseSession}
                onEndSession={handleEndSession}
                sessionPaused={sessionPaused}
              />
            )}
          </>
        ) : sessionEnded && sessionData ? (
          <Summary
            sessionData={sessionData}
            onRestartSession={handleRestartSession}
          />
        ) : sessionEnded && !sessionData ? (
          <p className="loading">Processing session data...</p>
        ) : (
          <HomePage
            userInfo={userInfo}
            onNavigateToSession={() => setShowSessionForm(true)}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
