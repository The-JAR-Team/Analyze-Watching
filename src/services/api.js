// src/services/api.js

import axios from 'axios';

/**
 * Fetches the list of available video IDs from the ready.JSON file.
 * @returns {Promise<Array<string>>} An array of video IDs.
 */
export const fetchAvailableVideos = async () => {
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/The-JAR-Team/viewDataFromDataBase/main/transcripts/ready.JSON'
    );
    return response.data.videos; // Assumes 'videos' is an array of video IDs
  } catch (error) {
    console.error('Error fetching available videos:', error);
    return [];
  }
};

/**
 * Fetches the questions for a specific video based on its ID.
 * @param {string} videoId - The ID of the video.
 * @returns {Promise<Array<Object>>} An array of question objects.
 */
export const fetchQuestionsForVideo = async (videoId) => {
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/The-JAR-Team/viewDataFromDataBase/main/transcripts/${videoId}_transcript.JSON`
    );
    return response.data.questions; // Assumes 'questions' is an array of question objects
  } catch (error) {
    console.error(`Error fetching questions for video ${videoId}:`, error);
    return [];
  }
};
