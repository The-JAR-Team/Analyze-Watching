import React, { useState } from 'react';

function SessionForm({ onStartSession }) {
  const [lectureSubject, setLectureSubject] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [mode, setMode] = useState('analyze');

  const extractVideoID = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const videoId = extractVideoID(videoUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }
    const lecture = {
      subject: lectureSubject,
      videoId: videoId,
    };
    const user = {
      name: userName,
      profile: userProfile,
    };
    onStartSession(lecture, user, mode);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Start a New Session</h2>
      <div>
        <label>Lecture Subject:</label>
        <select
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
      <div>
        <label>YouTube Video URL:</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <label>User Name:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>User Profile:</label>
        <input
          type="text"
          value={userProfile}
          onChange={(e) => setUserProfile(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="analyze">Analyze Mode</option>
          <option value="pause">Pause Mode</option>

        </select>
      </div>
      <button type="submit">Start Session</button>
    </form>
  );
}

export default SessionForm;
