// src/App.js

import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import SessionForm from './components/SessionForm';
import Summary from './components/Summary';

function App() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [mode, setMode] = useState('analyze'); // 'pause', 'question', or 'analyze'
  const [sessionData, setSessionData] = useState(null);
  const [lectureInfo, setLectureInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});

  const handleStartSession = (lecture, user, selectedMode) => {
    console.log(
      'Session started with lecture:',
      lecture,
      'user:',
      user,
      'mode:',
      selectedMode
    );
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
    setUserInfo({});
    setMode('analyze');
  };

  return (
    <div className="App">
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
    </div>
  );
}

export default App;
