// src/components/SessionForm.js

import React, { useState, useEffect } from 'react';
import { fetchAvailableVideos } from '../services/api';
import { getYouTubeVideoId } from '../utils/getYouTubeVideoId'; // Import the utility function

function SessionForm({ onStartSession }) {
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [lectureSubject, setLectureSubject] = useState('');
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [mode, setMode] = useState('analyze');

  // New state for YouTube URL input
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // Fetch the list of available videos when the component mounts
    const loadVideos = async () => {
      try {
        const videos = await fetchAvailableVideos();
        setAvailableVideos(videos);
      } catch (error) {
        console.error('Error fetching available videos:', error);
        setAvailableVideos([]);
      }
    };
    loadVideos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalVideoId = '';

    if (mode === 'question') {
      // Validation for Question Mode
      if (!selectedVideoId) {
        alert('Please select a video.');
        return;
      }
      finalVideoId = selectedVideoId;
    } else {
      // Validation for Analyze and Pause Modes
      if (!videoUrl) {
        alert('Please enter a YouTube URL.');
        return;
      }
      const extractedVideoId = getYouTubeVideoId(videoUrl);
      if (!extractedVideoId) {
        alert('Please enter a valid YouTube URL.');
        return;
      }
      console.log("extractedVideoId=" + extractedVideoId);
      finalVideoId = extractedVideoId;
    }

    // Further Validations
    if (!lectureSubject) {
      alert('Please select a lecture subject.');
      return;
    }
    if (!userName || !userProfile) {
      alert('Please enter your name and profile.');
      return;
    }

    // Construct the lecture and user objects
    const lecture = {
      subject: lectureSubject,
      videoId: finalVideoId,
    };
    const user = {
      name: userName,
      profile: userProfile,
    };

    // Optionally, set the selectedVideoId state if needed elsewhere
    if (mode === 'question') {
      setSelectedVideoId(finalVideoId);
    }

    // Start the session
    onStartSession(lecture, user, mode);
  };

  return (
    <form onSubmit={handleSubmit} className="session-form">
      <h2>Start a New Session</h2>

      {/* Lecture Subject Selection */}
      <div className="form-group">
        <label htmlFor="lectureSubject">Lecture Subject:</label>
        <select
          id="lectureSubject"
          value={lectureSubject}
          onChange={(e) => setLectureSubject(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a subject
          </option>
          <option value="Math">Math</option>
          <option value="Psychology">Psychology</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Biology">Biology</option>
          <option value="History">History</option>
          <option value="Physics">Physics</option>
        </select>
      </div>

      {/* Conditional Video Selection */}
      {mode === 'question' ? (
        <div className="form-group">
          <label htmlFor="videoSelect">Select Video:</label>
          <select
            id="videoSelect"
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a video
            </option>
            {availableVideos.map((videoId) => (
              <option key={videoId} value={videoId}>
                {videoId} {/* Replace with video titles if available */}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="videoUrl">YouTube Video URL:</label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="Enter YouTube URL"
            pattern="https?://.*" // Basic pattern to ensure it's a URL
            title="Please enter a valid YouTube URL."
          />
        </div>
      )}

      {/* User Name Input */}
      <div className="form-group">
        <label htmlFor="userName">User Name:</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>

      {/* User Profile Input */}
      <div className="form-group">
        <label htmlFor="userProfile">User Profile:</label>
        <input
          id="userProfile"
          type="text"
          value={userProfile}
          onChange={(e) => setUserProfile(e.target.value)}
          required
          placeholder="Enter your profile"
        />
      </div>

      {/* Mode Selection */}
      <div className="form-group">
        <label htmlFor="modeSelect">Mode:</label>
        <select
          id="modeSelect"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            // Reset video selections when mode changes
            setSelectedVideoId('');
            setVideoUrl('');
          }}
        >
          <option value="analyze">Analyze Mode</option>
          <option value="pause">Pause Mode</option>
          <option value="question">Question Mode</option>
        </select>
      </div>

      {/* Submit Button */}
      <button type="submit" className="start-button">
        Start Session
      </button>
    </form>
  );
}

export default SessionForm;
