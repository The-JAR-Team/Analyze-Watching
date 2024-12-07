import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import YouTube from 'react-youtube';
import { Bar } from 'react-chartjs-2';
import { fetchQuestionsForVideo } from '../services/api';
import '../VideoPlayer.css'; // Import the CSS file

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

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// QuestionModal Component
function QuestionModal({ question, onAnswer }) {
  const firstButtonRef = useRef(null);
  
  useEffect(() => {
    // Set focus to the first answer button when modal opens
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);
  
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
    >
      <div className="modal-content">
        <h3 id="question-modal-title">Question:</h3>
        <p>{question.question}</p>
        <div className="answers">
          {question.shuffledAnswers.map((ans, index) => (
            <button
              key={ans.key}
              onClick={() => onAnswer(ans.key)}
              className="answer-button"
              ref={index === 0 ? firstButtonRef : null} // Assign ref to first button
            >
              {ans.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// DecisionModal Component
function DecisionModal({ isCorrect, onDecision }) {
  const continueButtonRef = useRef(null);
  
  useEffect(() => {
    // Set focus to the first decision button when modal opens
    if (continueButtonRef.current) {
      continueButtonRef.current.focus();
    }
  }, []);
  
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-title"
    >
      <div className="modal-content">
        <h3 id="decision-modal-title">{isCorrect ? 'Correct!' : 'Incorrect.'}</h3>
        <p>What would you like to do?</p>
        <div className="decision-buttons">
          <button
            onClick={() => onDecision('continue')}
            className="decision-button"
            ref={continueButtonRef} // Assign ref to first button
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
      </div>
    </div>
  );
}

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

  const isLooking = useRef(false); // Immediate gaze detection
  const userFocused = useRef(false); // After buffer

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
  const graphUpdateInterval = 3000; // 3 seconds for quicker updates
  const focusInterval = useRef(null);

  // Question Mode states
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  // Using useRef for lastPromptedQuestionId to avoid stale closures
  const lastPromptedQuestionIdRef = useRef(null);
  const questionsRef = useRef([]);

  // **Ref to track if the session is frozen**
  const isFrozenRef = useRef(false);

  ////, setpromptedQuestionsRef] = useState(0); // Track next question
  const promptedQuestionsRef = useRef(new Set());

  const defaultQuestion = {
    question: 'Are you with us?',
    answers: [
      { key: 'answer1', text: 'Yes 100%', correct: true },
      { key: 'answer2', text: 'Yes 80%', correct: false },
      { key: 'answer3', text: 'No', correct: false },
      { key: 'answer4', text: 'Sleep', correct: false },
    ],
    time_start_I_can_ask_about_it: '00:00:00',
    timeInSeconds: 0,
  };

  // Effect to handle adding/removing no-scroll class on body
  useEffect(() => {
    if (showQuestionModal || showDecisionModal) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [showQuestionModal, showDecisionModal]);

  useEffect(() => {
    if (sessionEnded) {
      handleSessionEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.error(questions);
    }

    // Start collecting focus data
    startFocusInterval();

    // Fetch questions if in question mode
    if (mode === 'question' && lectureInfo.videoId) {
      fetchQuestionsForVideo(lectureInfo.videoId)
        .then((fetchedQuestions) => {
          console.log('Fetched Questions:', fetchedQuestions);
  
          let normalizedQuestions = [];
  
          if (Array.isArray(fetchedQuestions)) {
            normalizedQuestions = fetchedQuestions.map((q) => {
              // Extract answers from individual properties
              const answers = [
                { key: 'answer1', text: q.answer1, correct: q.answer1_correct || false },
                { key: 'answer2', text: q.answer2, correct: q.answer2_correct || false },
                { key: 'answer3', text: q.answer3, correct: q.answer3_correct || false },
                { key: 'answer4', text: q.answer4, correct: q.answer4_correct || false },
              ].filter(ans => ans.text); // Remove undefined answers
  
              return {
                ...q,
                answers,
                timeInSeconds: timeStringToSeconds(q.time_start_I_can_ask_about_it), // Add timeInSeconds
              };
            });
          } else if (fetchedQuestions && Array.isArray(fetchedQuestions.questions)) {
            normalizedQuestions = fetchedQuestions.questions.map((q) => {
              const answers = [
                { key: 'answer1', text: q.answer1, correct: q.answer1_correct || false },
                { key: 'answer2', text: q.answer2, correct: q.answer2_correct || false },
                { key: 'answer3', text: q.answer3, correct: q.answer3_correct || false },
                { key: 'answer4', text: q.answer4, correct: q.answer4_correct || false },
              ].filter(ans => ans.text); // Remove undefined answers
  
              return {
                ...q,
                answers,
                timeInSeconds: timeStringToSeconds(q.time_start_I_can_ask_about_it), // Add timeInSeconds
              };
            });
          } else {
            console.log('No questions available in fetched data.');
          }
  
          // Sort questions by timeInSeconds in ascending order
          normalizedQuestions.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
  
          // Define endTimeInSeconds for each question
          normalizedQuestions = normalizedQuestions.map((q, index, arr) => {
            const nextQuestion = arr[index + 1];
            return {
              ...q,
              endTimeInSeconds: nextQuestion ? nextQuestion.timeInSeconds : Number.MAX_SAFE_INTEGER, // Last question's end time is video end
            };
          });
  
          setQuestions(normalizedQuestions);
          questionsRef.current = normalizedQuestions; // Update ref
          console.log(`Questions loaded and sorted: ${normalizedQuestions.length}`);
        })
        .catch((error) => {
          console.error('Error fetching questions:', error);
          setQuestions([]);
          questionsRef.current = [];
        });
    }

    return () => {
      if (focusInterval.current) clearInterval(focusInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lectureInfo.videoId]);

  useEffect(() => {
    if (playerRef.current) {
      if (sessionPaused) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  }, [sessionPaused]);

  const handleSessionEnd = () => {
    console.log('Session ended, processing data...');
    if (focusInterval.current) clearInterval(focusInterval.current);

    // Compute the summary
    const intervalDuration = graphUpdateInterval / 1000; // in seconds
    const intervals = focusData.map((focus, index) => {
      const start = new Date(startTime + index * graphUpdateInterval);
      const end = new Date(startTime + (index + 1) * graphUpdateInterval);
      return {
        interval: `${(index * intervalDuration).toFixed(0)}-${(
          (index + 1) * intervalDuration
        ).toFixed(0)}s`,
        start_time: start.toLocaleTimeString(),
        end_time: end.toLocaleTimeString(),
        percent_not_focused: focus === 1 ? 0 : 100,
      };
    });

    const totalUnfocusedTime =
      focusData.filter((focus) => focus === 0).length * graphUpdateInterval;

    const summaryObj = {
      lecture: {
        subject: lectureInfo.subject || 'Unknown',
        videoId: lectureInfo.videoId || 'Unknown',
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
      chartData: chartData,
    };

    console.log('Session Summary:', summaryObj);
    onSessionData && onSessionData(summaryObj);
  };

  /**
   * Converts a time string "hh:mm:ss" or "mm:ss" to total seconds.
   * @param {string} timeStr - The time string.
   * @returns {number} Total seconds.
   */
  const timeStringToSeconds = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.some(isNaN)) {
      console.error(`Invalid time format: ${timeStr}`);
      return 0;
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else {
      console.warn(`Unexpected time format: ${timeStr}`);
      return 0;
    }
  };

  const startFocusInterval = () => {
    focusInterval.current = setInterval(() => {
      // **Check if the session is frozen**
      if (isFrozenRef.current) {
        console.log('Session is frozen. Skipping focus graph update.');
        return;
      }

      setFocusData((prevData) => {
        const newData = [...prevData, userFocused.current ? 1 : 0];
        const newLabels = newData.map(
          (_, index) => `${index * 3}-${(index + 1) * 3}s`
        ); // 3-second intervals
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

        return newData;
      });
    }, graphUpdateInterval);
  };

  const onResults = (results) => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastGazeTime.current;
    lastGazeTime.current = currentTime;

    let gaze = 'Face not detected';
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      gaze = estimateGaze(results.multiFaceLandmarks[0]);
    }

    handleVideoPlayback(gaze, deltaTime);
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
    if (avgGazeRatio < 0.42) {
      return 'Looking left';
    } else if (avgGazeRatio > 0.58) {
      return 'Looking right';
    } else {
      return 'Looking center';
    }
  };

  const handleVideoPlayback = (gaze, deltaTime) => {
    console.log(`Gaze detected: ${gaze}`);
  
    // **Check if the session is frozen**
    if (isFrozenRef.current) {
      console.log('Session is frozen. Skipping focus tracking.');
      return;
    }
  
    const player = playerRef.current;
    if (!player) return;
  
    const currentVideoTime = player.getCurrentTime(); // Current time in seconds
    console.log(`Current Video Time: ${currentVideoTime}s`);
  
    if (gaze === 'Looking center' && !sessionPaused) {
      if (!isLooking.current) {
        isLooking.current = true;
        setIsLookingState(true);
        console.log('User started looking at center.');
      }
      unfocusedTime.current = 0;
  
      if (!userFocused.current) {
        focusedTime.current += deltaTime;
        console.log(`Focused time accumulated: ${focusedTime.current}ms`);
  
        if (focusedTime.current >= focusThreshold) {
          userFocused.current = true;
          setUserFocusedState(true);
          focusedTime.current = 0;
          console.log('User is now focused.');
  
          // Resume video playback if in 'pause' mode
          if (
            mode === 'pause' &&
            !showQuestionModal &&
            !showDecisionModal
          ) {
            player.playVideo();
            setIsPlaying(true);
            console.log('Video playback resumed.');
          }
        }
      } else {
        focusedTime.current = 0;
      }
    } else {
      if (isLooking.current) {
        isLooking.current = false;
        setIsLookingState(false);
        console.log('User stopped looking at center.');
      }
      focusedTime.current = 0;
  
      if (userFocused.current) {
        unfocusedTime.current += deltaTime;
        console.log(`Unfocused time accumulated: ${unfocusedTime.current}ms`);
  
        if (unfocusedTime.current >= unfocusThreshold) {
          userFocused.current = false;
          setUserFocusedState(false);
          unfocusedTime.current = 0;
          console.log('User is now unfocused.');
  
          // Pause video playback if in 'pause' mode
          if (mode === 'pause') {
            player.pauseVideo();
            setIsPlaying(false);
            console.log('Video playback paused.');
          }
  
          // Trigger question prompt if in 'question' mode
          if (mode === 'question' && !showQuestionModal && !showDecisionModal) {
            // Find all questions where currentVideoTime is within their time range and not yet prompted
            const dueQuestions = questionsRef.current.filter(
              (q) =>
                q.timeInSeconds <= currentVideoTime &&
                currentVideoTime < q.endTimeInSeconds// &&
                //!promptedQuestionsRef.current.has(q.q_id)
            );
  
            if (dueQuestions.length > 0) {
              // Prompt the first due question
              const questionToPrompt = dueQuestions[0];
              console.log(`Prompting Question ID: ${questionToPrompt.q_id} at ${questionToPrompt.timeInSeconds}s`);
              promptQuestion(questionToPrompt);
              // Mark as prompted
              promptedQuestionsRef.current.add(questionToPrompt.q_id);
            } else {
              console.log('No question to prompt at this time.');
            }
          }
        }
      } else {
        // User never focused before losing center
        if (
          mode === 'pause' &&
          gaze !== 'Looking center' &&
          !showQuestionModal &&
          !showDecisionModal
        ) {
          player.pauseVideo();
          setIsPlaying(false);
          console.log('Video playback paused due to immediate unfocus.');
        }
  
        if (
          mode === 'question' &&
          !showQuestionModal &&
          !showDecisionModal &&
          gaze !== 'Looking center'
        ) {
          // Similar logic as above
          const dueQuestions = questionsRef.current.filter(
            (q) =>
              q.timeInSeconds <= currentVideoTime &&
              currentVideoTime < q.endTimeInSeconds &&
              !promptedQuestionsRef.current.has(q.q_id)
          );
  
          if (dueQuestions.length > 0) {
            // Prompt the first due question
            const questionToPrompt = dueQuestions[0];
            console.log(`Prompting Question ID: ${questionToPrompt.q_id} at ${questionToPrompt.timeInSeconds}s`);
            promptQuestion(questionToPrompt);
            // Mark as prompted
            promptedQuestionsRef.current.add(questionToPrompt.q_id);
          } else {
            console.log('No question to prompt at this time.');
          }
        }
      }
    }
  };
  

  /**
   * Prompts a question to the user.
   * @param {Object|null} question - The question object or null for default question.
   */
  const promptQuestion = (question) => {
    if (question) {
      const shuffledAnswers = shuffleAnswers(question);
      if (shuffledAnswers.length === 0) {
        console.log('Shuffled answers are empty. Using default question.');
        question = null;
      } else {
        setCurrentQuestion({ ...question, shuffledAnswers });
        console.log(`Prompting Question ID: ${question.q_id}`);
        lastPromptedQuestionIdRef.current = question.q_id; // Update ref
      }
    } else {
      const shuffledAnswers = shuffleAnswers(defaultQuestion);
      setCurrentQuestion({ ...defaultQuestion, shuffledAnswers });
      console.log('Prompting Default Question');
      lastPromptedQuestionIdRef.current = null;
    }

    // **Freeze the session**
    isFrozenRef.current = true;

    setShowQuestionModal(true);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      console.log('Video playback paused for question');
    }
  };

  /**
   * Shuffles the answers of a question.
   * Ensures the first answer is always correct for testing purposes.
   * @param {Object} question - The question object.
   * @returns {Array<Object>} Shuffled answers with the first answer being correct.
   */
  const shuffleAnswers = (question) => {
    if (!question.answers || !Array.isArray(question.answers)) {
      console.error('Question does not have a valid answers array:', question);
      return [];
    }

    // Find the correct answer
    const correctAnswerIndex = question.answers.findIndex(ans => ans.correct);

    if (correctAnswerIndex === -1) {
      console.warn('No correct answer found. Ensuring the first answer is marked as correct.');
      // If no answer is marked correct, default the first one
      question.answers[0].correct = true;
      return question.answers;
    }

    // Move the correct answer to the first position
    const [correctAnswer] = question.answers.splice(correctAnswerIndex, 1);
    return [correctAnswer, ...question.answers];
  };

  /**
   * Handles the user's answer selection.
   * @param {string} selectedKey - The key of the selected answer.
   */
  const handleAnswer = (selectedKey) => {
    if (!currentQuestion) return;
    const selectedAnswer = currentQuestion.shuffledAnswers.find((ans) => ans.key === selectedKey);
    const isCorrect = selectedAnswer ? selectedAnswer.correct : false;
    setIsAnswerCorrect(isCorrect);
    setShowQuestionModal(false);
    setShowDecisionModal(true);
    console.log(`User selected answer: ${selectedKey}, Correct: ${isCorrect}`);
  };

  /**
   * Handles the user's decision after answering a question.
   * @param {string} decision - 'continue' or 'rewind'.
   */
  const handleDecision = (decision) => {
    console.log(`User decision: ${decision}`); // Debugging log
  
    if (decision === 'continue') {
      setShowDecisionModal(false);
      setIsAnswerCorrect(null);
      if (playerRef.current) {
        playerRef.current.playVideo();
        setIsPlaying(true);
        console.log('User chose to continue watching');
      }
  
      // **Unfreeze the session**
      isFrozenRef.current = false;
    } else if (decision === 'rewind') {
      setShowDecisionModal(false);
      setIsAnswerCorrect(null);
      if (currentQuestion && playerRef.current) {
        const questionTimeSec = timeStringToSeconds(currentQuestion.time_start_I_can_ask_about_it);
        playerRef.current.seekTo(questionTimeSec, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
        console.log(`User chose to rewind to ${questionTimeSec}s`);
      }
  
      // **Unfreeze the session**
      isFrozenRef.current = false;
    }
  };
  

  const onPlayerReadyHandler = (event) => {
    playerRef.current = event.target;
    if (sessionPaused) {
      event.target.pauseVideo();
      setIsPlaying(false);
    } else {
      event.target.playVideo();
      setIsPlaying(true);
    }
    console.log('YouTube player ready');
  };

  const onPlayerStateChange = (event) => {
    const playerState = event.data;
    if (playerState === 1) {
      // Playing
      if (!isPlaying) {
        setIsPlaying(true);
        console.log('Video started playing');
      }
    } else if (playerState === 2) {
      // Paused
      if (isPlaying) {
        setIsPlaying(false);
        console.log('Video paused');
      }
    }
  };

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

  return (
    <div className="video-player">
      <YouTube
        videoId={lectureInfo.videoId}
        opts={{
          height: '390',
          width: '640',
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
          },
        }}
        onReady={onPlayerReadyHandler}
        onStateChange={onPlayerStateChange}
      />

      <div className="status-info">
        <p>
          <strong>Current Status:</strong>{' '}
          {isLookingState ? 'Looking at Center' : 'Not Looking at Center'}
        </p>
        <p>
          <strong>Focused Status:</strong>{' '}
          {userFocusedState ? 'Focused' : 'Not Focused'}
        </p>
      </div>

      <div className="focus-graph">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <video ref={webcamRef} style={{ display: 'none' }} />

      {/* Question Modal */}
      {showQuestionModal && currentQuestion && (
        <QuestionModal question={currentQuestion} onAnswer={handleAnswer} />
      )}

      {/* Decision Modal */}
      {showDecisionModal && (
        <DecisionModal
          isCorrect={isAnswerCorrect}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}

export default VideoPlayer;