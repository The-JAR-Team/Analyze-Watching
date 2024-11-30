// Controls.js

import React from 'react';

function Controls({ onPauseSession, onEndSession, sessionPaused }) {
  return (
    <div>
      <button onClick={onPauseSession}>
        {sessionPaused ? 'Resume Session' : 'Pause Session'}
      </button>
      <button onClick={() => onEndSession()}>End Session</button>
    </div>
  );
}

export default Controls;
