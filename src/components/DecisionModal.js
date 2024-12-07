// src/components/DecisionModal.js

import React from 'react';

function DecisionModal({ isCorrect, onDecision, isContinueEnabled }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{isCorrect ? 'Correct!' : 'Incorrect.'}</h3>
        <p>What would you like to do?</p>
        <div className="decision-buttons">
          <button
            onClick={() => onDecision('continue')}
            disabled={!isContinueEnabled}
            className="decision-button"
          >
            Continue Watching
          </button>
          <button
            onClick={() => onDecision('rewind')}
            className="decision-button"
          >
            Rewind
          </button>
        </div>
        {!isContinueEnabled && (
          <p className="warning-text">
            Focus on the screen to enable &quot;Continue&quot;!
          </p>
        )}
      </div>
    </div>
  );
}

export default DecisionModal;
