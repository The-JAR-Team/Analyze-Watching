// Summary.js

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

function Summary({ sessionData, onRestartSession }) {
  // Move useState to the top level
  const [copySuccess, setCopySuccess] = useState('');

  if (!sessionData) {
    return <p>Error: No session data available.</p>;
  }

  const { lecture, user, summary, chartData } = sessionData;

  if (!lecture || !user || !summary || !chartData) {
    return <p>Error: Incomplete session data.</p>;
  }

  // Calculate total focused and unfocused time
  const totalIntervals = summary.focus_intervals?.length || 0;

  if (totalIntervals === 0) {
    return <p>Error: No focus intervals data available.</p>;
  }

  const totalFocused = summary.focus_intervals.filter(
    (interval) => interval.percent_not_focused === 0
  ).length;
  const focusPercentage = ((totalFocused / totalIntervals) * 100).toFixed(2);

  // Determine session quartiles
  const quartiles = [
    { range: '0-25%', intervals: [] },
    { range: '25-50%', intervals: [] },
    { range: '50-75%', intervals: [] },
    { range: '75-100%', intervals: [] },
  ];

  // Assign intervals to quartiles
  summary.focus_intervals.forEach((interval, index) => {
    const quartileIndex = Math.floor((index * 4) / totalIntervals);
    quartiles[quartileIndex].intervals.push(interval);
  });

  // Calculate unfocused percentage for each quartile
  quartiles.forEach((quartile) => {
    const numIntervals = quartile.intervals.length;
    if (numIntervals > 0) {
      const numUnfocusedIntervals = quartile.intervals.filter(
        (interval) => interval.percent_not_focused > 0
      ).length;
      quartile.unfocusedPercentage = ((numUnfocusedIntervals / numIntervals) * 100).toFixed(2);
    } else {
      quartile.unfocusedPercentage = 'N/A';
    }
  });

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (s)',
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
  };

  console.log('Displaying summary:', sessionData);

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
        <strong>Lecture Title:</strong> {lecture.title}
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
        <strong>Focused Percentage:</strong> {focusPercentage}%
      </p>
      <p>
        <strong>Total Unfocused Time:</strong>{' '}
        {(summary.total_unfocused_time_ms / 1000).toFixed(2)} seconds
      </p>

      <h3>Unfocused Session Parts:</h3>
      <ul>
        {quartiles.map((quartile) => (
          <li key={quartile.range}>
            Between {quartile.range} of the session: {quartile.unfocusedPercentage}% unfocused
          </li>
        ))}
      </ul>

      <h3>Focus Over Time:</h3>
      {chartData && (
        <div className="focus-graph">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <button onClick={handleCopyJSON}>Copy JSON to Clipboard</button>
      {copySuccess && <p>{copySuccess}</p>}
      <button onClick={onRestartSession}>Back to Main</button>
    </div>
  );
}

export default Summary;
