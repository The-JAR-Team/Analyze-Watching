// src/components/EyeDebugger.js

import React, { useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import './EyeDebugger.css'; 

function EyeDebugger({ enabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
     
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

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
    faceMeshRef.current = faceMesh;

    if (videoRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }

  
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      faceMesh.close();
    };

  }, [enabled]); 

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Adjust canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

   
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

  
      const leftEyeIndices = [
        33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161,
        246,
      ];
      const rightEyeIndices = [
        362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385,
        384, 398,
      ];

 
      const drawEye = (indices) => {
        ctx.beginPath();
        indices.forEach((index, i) => {
          const landmark = landmarks[index];
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();
      };


      drawEye(leftEyeIndices);
      drawEye(rightEyeIndices);
    }
  };

  return enabled ? (
    <div className="eye-debugger">
      <video ref={videoRef} className="debug-video" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="debug-canvas" />
    </div>
  ) : null;
}

export default EyeDebugger;
