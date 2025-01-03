// src/components/HomePage.js
import './HomePage.css';
import React, { useEffect, useState } from 'react';

function HomePage({ userInfo, onNavigateToSession }) {
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch videos from the server
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:5000/videos');
        const data = await response.json();
        if (data.success) {
          setVideos(data.videos);
        } else {
          console.error('Failed to fetch videos:', data.message);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="home-page">
      <h1>Welcome, {userInfo?.first_name || 'User'}!</h1>
      <button onClick={onNavigateToSession} className="submit-button">
        Submit Video
      </button>

      <h2>Available Videos</h2>
      {loading ? (
        <p>Loading videos...</p>
      ) : (
        Object.entries(videos).map(([subject, videoList]) => (
          <div key={subject}>
            <h3>{subject}</h3>
            <ul>
              {videoList.map((video) => (
                <li key={video.video_id}>
                  <strong>{video.name}</strong> - {video.description}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;
