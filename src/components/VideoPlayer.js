// VideoPlayer.js

import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import YouTube from 'react-youtube';

// Import Chart.js components
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Import React wrapper
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function VideoPlayer({
  mode,
  sessionPaused,
  sessionEnded,
  onSessionData,
  lectureInfo,
  userInfo,
}) {
  const webcamRef = useRef(null);
  const playerRef = useRef(null);

  // Use refs for immediate state updates
  const isLooking = useRef(false); // Immediate gaze detection
  const userFocused = useRef(false); // After buffer

  // State variables for display
  const [isLookingState, setIsLookingState] = useState(false);
  const [userFocusedState, setUserFocusedState] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [focusData, setFocusData] = useState([]);
  const [startTime] = useState(Date.now());
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Focus Over Time',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const unfocusedTime = useRef(0);
  const focusedTime = useRef(0);
  const lastGazeTime = useRef(Date.now());
  const unfocusThreshold = 2000; // 2 seconds to become unfocused
  const focusThreshold = 2000; // 2 seconds to become focused
  const graphUpdateInterval = 10000; // 10 seconds
  const focusInterval = useRef(null);

  // Move handleSessionEnd before useEffect
  const handleSessionEnd = () => {
    console.log('Session ended, processing data...');
    if (focusInterval.current) clearInterval(focusInterval.current);
    // Compute the summary
    const intervalDuration = graphUpdateInterval / 1000; // in seconds
    const intervals = focusData.map((focus, index) => {
      const start = new Date(startTime + index * graphUpdateInterval);
      const end = new Date(startTime + (index + 1) * graphUpdateInterval);
      return {
        interval: `${index * intervalDuration}-${(index + 1) * intervalDuration}`,
        start_time: start.toLocaleTimeString(),
        end_time: end.toLocaleTimeString(),
        percent_not_focused: focus === 1 ? 0 : 100,
      };
    });

    const totalUnfocusedTime =
      focusData.filter((focus) => focus === 0).length * graphUpdateInterval;

    const summary = {
      lecture: {
        title: lectureInfo.title || 'Unknown',
        duration_minutes: Math.floor((Date.now() - startTime) / 60000),
        start_time: new Date(startTime).toLocaleTimeString(),
      },
      user: {
        name: userInfo.name || 'Unknown',
        profile: userInfo.profile || 'Unknown',
      },
      summary: {
        focus_intervals: intervals,
        total_unfocused_time_ms: totalUnfocusedTime,
      },
    };

    console.log('Summary:', summary);

    if (onSessionData) {
      onSessionData(summary, chartData);
      console.log('Session data sent to parent component');
    }
  };

  useEffect(() => {
    // If session is ended, process data
    if (sessionEnded) {
      console.log('Session ended detected in VideoPlayer');
      handleSessionEnd();
    }
  }, [sessionEnded]);

  useEffect(() => {
    // Initialize MediaPipe FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    // Access the webcam
    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    } else {
      console.error('Webcam video element not found');
    }

    // Start collecting focus data
    startFocusInterval();

    return () => {
      // Cleanup
      if (focusInterval.current) clearInterval(focusInterval.current);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      if (sessionPaused) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [sessionPaused]);

  const startFocusInterval = () => {
    focusInterval.current = setInterval(() => {
      setFocusData((prevData) => {
        const newData = [...prevData, userFocused.current ? 1 : 0];
        const newLabels = newData.map(
          (_, index) => ((index + 1) * graphUpdateInterval) / 1000
        );
        const newColors = newData.map((value) => (value === 1 ? 'green' : 'red'));

        setChartData({
          labels: newLabels,
          datasets: [
            {
              label: 'Focus Over Time',
              data: newData,
              backgroundColor: newColors,
              borderColor: 'black',
              borderWidth: 1,
            },
          ],
        });
        console.log('Focus data updated:', newData);
        return newData;
      });
    }, graphUpdateInterval);
  };

  const onResults = (results) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastGazeTime.current;
    lastGazeTime.current = currentTime;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const gaze = estimateGaze(landmarks);
      handleVideoPlayback(gaze, deltaTime);
    } else {
      handleVideoPlayback('Face not detected', deltaTime);
    }
  };

  const estimateGaze = (landmarks) => {
    const leftEye = {
      outer: landmarks[33],
      inner: landmarks[133],
      center: landmarks[468],
    };

    const rightEye = {
      outer: landmarks[362],
      inner: landmarks[263],
      center: landmarks[473],
    };

    const leftGazeRatio =
      (leftEye.center.x - leftEye.outer.x) /
      (leftEye.inner.x - leftEye.outer.x);
    const rightGazeRatio =
      (rightEye.center.x - rightEye.outer.x) /
      (rightEye.inner.x - rightEye.outer.x);

    const avgGazeRatio = (leftGazeRatio + rightGazeRatio) / 2;

    // Adjusted thresholds for leniency
    if (avgGazeRatio < 0.4) {
      return 'Looking left';
    } else if (avgGazeRatio > 0.6) {
      return 'Looking right';
    } else {
      return 'Looking center';
    }
  };

  const handleVideoPlayback = (gaze, deltaTime) => {
    // Console logs for debugging
    console.log('Gaze:', gaze);
    console.log('DeltaTime:', deltaTime);
    console.log(
      'Before update - isLooking:',
      isLooking.current,
      'userFocused:',
      userFocused.current
    );

    if (gaze === 'Looking center' && !sessionPaused) {
      if (!isLooking.current) {
        isLooking.current = true;
        setIsLookingState(true);
      }
      unfocusedTime.current = 0;
      if (!userFocused.current) {
        focusedTime.current += deltaTime;
        console.log('Incremented focusedTime:', focusedTime.current);
        if (focusedTime.current >= focusThreshold) {
          userFocused.current = true;
          setUserFocusedState(true);
          focusedTime.current = 0;
          console.log('User is now focused');
          // Resume video playback if in 'pause' mode
          if (!isPlaying && mode === 'pause' && playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
            console.log('Video playback resumed');
          }
        }
      } else {
        focusedTime.current = 0;
      }
    } else {
      if (isLooking.current) {
        isLooking.current = false;
        setIsLookingState(false);
      }
      focusedTime.current = 0;
      if (userFocused.current) {
        unfocusedTime.current += deltaTime;
        console.log('Incremented unfocusedTime:', unfocusedTime.current);
        if (unfocusedTime.current >= unfocusThreshold) {
          userFocused.current = false;
          setUserFocusedState(false);
          unfocusedTime.current = 0;
          console.log('User is now unfocused');
          if (isPlaying && mode === 'pause' && playerRef.current) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            console.log('Video playback paused');
          }
        }
      } else {
        unfocusedTime.current = 0;
      }
    }

    console.log(
      'After update - isLooking:',
      isLooking.current,
      'userFocused:',
      userFocused.current
    );
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    if (sessionPaused) {
      event.target.pauseVideo();
    } else {
      event.target.playVideo();
    }
  };

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

  return (
    <div className="video-player">
      <YouTube
        videoId={lectureInfo.videoId || 'dQw4w9WgXcQ'}
        opts={{
          height: '390',
          width: '640',
          playerVars: {
            autoplay: 1,
          },
        }}
        onReady={onPlayerReady}
      />
      <p className="status">
        Current Status:{' '}
        {isLookingState ? 'Looking at Center' : 'Not Looking at Center'}
      </p>
      <p className="status">
        Focused Status: {userFocusedState ? 'Focused' : 'Not Focused'}
      </p>
      <div className="focus-graph">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <video ref={webcamRef} style={{ display: 'none' }}></video>
    </div>
  );
}

export default VideoPlayer;
