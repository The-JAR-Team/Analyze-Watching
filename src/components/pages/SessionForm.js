// src/components/pages/SessionForm.js

import React, { useState } from 'react';
import { getYouTubeVideoId } from '../../utils/getYouTubeVideoId'; // Correct relative path

function SessionForm() {
  const [lectureSubject, setLectureSubject] = useState('');
  const [videoName, setVideoName] = useState(''); // Updated field
  const [description, setDescription] = useState(''); // Updated field
  const [videoUrl, setVideoUrl] = useState(''); // New field for YouTube URL input

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalVideoId = '';

    if (!videoUrl) {
      alert('Please enter a YouTube URL.');
      return;
    }
    const extractedVideoId = getYouTubeVideoId(videoUrl);
    if (!extractedVideoId) {
      alert('Please enter a valid YouTube URL.');
      return;
    }
    finalVideoId = extractedVideoId;

    if (!lectureSubject || !videoName || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    const videoData = {
      subject: lectureSubject,
      videoId: finalVideoId,
      videoName,
      description,
    };

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      if (response.ok) {
        alert('Video uploaded successfully!');
        // Optionally clear the form or redirect
      } else {
        const errorData = await response.json();
        alert(`Failed to upload video: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="session-form">
      <h2>Upload a Video</h2>

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

      <div className="form-group">
        <label htmlFor="videoUrl">YouTube Video URL:</label>
        <input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
          placeholder="Enter YouTube URL"
        />
      </div>

      <div className="form-group">
        <label htmlFor="videoName">Video Name:</label>
        <input
          id="videoName"
          type="text"
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          required
          placeholder="Enter video name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Enter video description"
        />
      </div>

      <button type="submit" className="submit-button">
        Upload Video
      </button>
    </form>
  );
}

export default SessionForm;
