// src/components/Controls.js

import React from 'react';

function Controls({ onPauseSession, onEndSession, sessionPaused }) {
  return (
    <div className="controls">
      <button onClick={onPauseSession} className="control-button">
        {sessionPaused ? 'Resume Session' : 'Pause Session'}
      </button>
      <button onClick={onEndSession} className="control-button">
        End Session
      </button>
    </div>
  );
}

export default Controls;
