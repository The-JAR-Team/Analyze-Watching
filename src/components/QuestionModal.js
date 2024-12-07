// src/components/QuestionModal.js

import React from 'react';

function QuestionModal({ question, onAnswer }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Question:</h3>
        <p>{question.question}</p>
        <div className="answers">
          {question.shuffledAnswers.map((ans) => (
            <button
              key={ans.key}
              onClick={() => onAnswer(ans.key)}
              className="answer-button"
            >
              {ans.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionModal;
