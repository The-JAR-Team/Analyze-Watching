// src/utils/getYouTubeVideoId.js

/**
 * Extracts the YouTube video ID from a given URL.
 * Supports various YouTube URL formats.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} - The extracted video ID or null if not found.
 */
export function getYouTubeVideoId(url) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    console.log(match)
    return match ? match[1] : null;
  }
  