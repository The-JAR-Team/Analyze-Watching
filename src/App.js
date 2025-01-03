import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import SessionForm from './components/SessionForm';
import Summary from './components/Summary';
import EyeDebugger from './components/EyeDebugger';
import Login from './components/Login';

function App() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [mode, setMode] = useState('analyze');
  const [sessionData, setSessionData] = useState(null);
  const [lectureInfo, setLectureInfo] = useState({});
  const [userInfo, setUserInfo] = useState(null); // Now holds Google user info

  const handleStartSession = (lecture, selectedMode) => {
    console.log('Session started with lecture:', lecture, 'mode:', selectedMode);
    setLectureInfo(lecture);
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
    setUserInfo(null);
    setMode('analyze');
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
  
      console.log('Google Login Successful. Token:', token);
  
      // Send the token to the server
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Server Response:', data);
  
        // Handle the data returned by the server (e.g., store in state)
        setUserInfo(data.user); // Assuming the server returns user data
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
        ) : (
          <>
            <EyeDebugger enabled={false} />
            {!sessionStarted && !sessionEnded && (
              <SessionForm onStartSession={handleStartSession} />
            )}
            {sessionStarted && (
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
            )}
            {sessionEnded && sessionData ? (
              <Summary
                sessionData={sessionData}
                onRestartSession={handleRestartSession}
              />
            ) : sessionEnded && !sessionData ? (
              <p className="loading">Processing session data...</p>
            ) : null}
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
