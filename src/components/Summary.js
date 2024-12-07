// src/components/Summary.js

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

function Summary({ sessionData, onRestartSession }) {
  const [copySuccess, setCopySuccess] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (sessionData) {
      saveSessionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  const { lecture, user, summary, chartData } = sessionData;

  const saveSessionData = async () => {
    try {
      const response = await axios.post('https://tin-luck-measure.glitch.me/api/sessions', {
        ...sessionData,
        focusPercentage: calculateFocusPercentage(),
      });
      setSaveSuccess('Session data saved to the server.');
      console.log('Server response:', response.data);
    } catch (error) {
      setSaveSuccess('Failed to save session data to the server.');
      console.error('Error saving session data:', error);
    }
  };

  const calculateFocusPercentage = () => {
    if (!summary || !summary.focus_intervals) return 0;
    const total = summary.focus_intervals.length;
    if (total === 0) return 0;
    const focused = summary.focus_intervals.filter(
      (interval) => interval.percent_not_focused === 0
    ).length;
    return ((focused / total) * 100).toFixed(2);
  };

  // Determine session quartiles
  const quartiles = [
    { range: '0-25%', intervals: [] },
    { range: '25-50%', intervals: [] },
    { range: '50-75%', intervals: [] },
    { range: '75-100%', intervals: [] },
  ];

  summary.focus_intervals.forEach((interval, index) => {
    const quartileIndex = Math.floor((index * 4) / summary.focus_intervals.length);
    quartiles[quartileIndex].intervals.push(interval);
  });

  quartiles.forEach((quartile) => {
    const numIntervals = quartile.intervals.length;
    if (numIntervals > 0) {
      const numUnfocusedIntervals = quartile.intervals.filter(
        (interval) => interval.percent_not_focused > 0
      ).length;
      quartile.unfocusedPercentage = (
        (numUnfocusedIntervals / numIntervals) *
        100
      ).toFixed(2);
    } else {
      quartile.unfocusedPercentage = 'N/A';
    }
  });

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Interval (s)',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Focus (1 = Focused, 0 = Not Focused)',
        },
        ticks: {
          stepSize: 1,
          min: 0,
          max: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const handleCopyJSON = () => {
    const jsonData = JSON.stringify(sessionData, null, 2); // Pretty print JSON

    if (navigator.clipboard && window.isSecureContext) {
      // Navigator clipboard API method
      navigator.clipboard.writeText(jsonData).then(
        function () {
          setCopySuccess('Session data copied to clipboard!');
        },
        function (err) {
          setCopySuccess('Failed to copy session data.');
          console.error('Async: Could not copy text: ', err);
        }
      );
    } else {
      // Fallback method using textarea
      const textArea = document.createElement('textarea');
      textArea.value = jsonData;
      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopySuccess('Session data copied to clipboard!');
        } else {
          setCopySuccess('Failed to copy session data.');
        }
      } catch (err) {
        setCopySuccess('Failed to copy session data.');
        console.error('Fallback: Oops, unable to copy', err);
      }

      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="summary">
      <h2>Session Summary</h2>
      <p>
        <strong>Lecture Subject:</strong> {lecture.subject}
      </p>
      <p>
        <strong>Video ID:</strong> {lecture.videoId}
      </p>
      <p>
        <strong>User:</strong> {user.name}
      </p>
      <p>
        <strong>Profile:</strong> {user.profile}
      </p>
      <p>
        <strong>Duration:</strong> {lecture.duration_minutes} minutes
      </p>
      <p>
        <strong>Start Time:</strong> {lecture.start_time}
      </p>
      <p>
        <strong>Focused Percentage:</strong> {calculateFocusPercentage()}%
      </p>
      <p>
        <strong>Total Unfocused Time:</strong>{' '}
        {(summary.total_unfocused_time_ms / 1000).toFixed(2)} seconds
      </p>

      {saveSuccess && <p>{saveSuccess}</p>}

      <h3>Unfocused Session Parts:</h3>
      <ul>
        {quartiles.map((quartile) => (
          <li key={quartile.range}>
            Between {quartile.range} of the session:{' '}
            {quartile.unfocusedPercentage}% unfocused
          </li>
        ))}
      </ul>

      <h3>Focus Over Time:</h3>
      {chartData && (
        <div className="focus-graph">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <button onClick={handleCopyJSON} className="copy-button">
        Copy JSON to Clipboard
      </button>
      {copySuccess && <p>{copySuccess}</p>}
      <button onClick={onRestartSession} className="restart-button">
        Back to Main
      </button>
    </div>
  );
}

export default Summary;
