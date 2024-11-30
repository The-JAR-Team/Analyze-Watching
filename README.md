# Focus Session Analyzer

The **Focus Session Analyzer** is a React-based web application designed to track and analyze a user's focus while watching a YouTube video. Using **MediaPipe FaceMesh**, the app detects user gaze to determine focus levels and provides real-time visualizations along with a detailed session summary.

## Features
1. **Real-Time Gaze Detection**:
   - Tracks user gaze and determines if they are focused on the screen.
   - Automatically pauses or resumes the video in "Pause Mode" based on user focus.

2. **Session Analysis**:
   - Collects data on focus intervals and generates a detailed analysis.
   - Summarizes total focused and unfocused times with focus percentages.

3. **Interactive Graphs**:
   - Displays focus over time as a bar chart.
   - Highlights session intervals with focus and unfocus percentages.

4. **Customizable Modes**:
   - **Pause Mode**: Automatically controls video playback based on focus.
   - **Analyze Mode**: Tracks data without affecting video playback.

5. **User-Friendly Interface**:
   - Simple UI for starting and controlling sessions.
   - Responsive charts and session summaries.

---

## Screenshots
    (soon wil added bruh)
1. **Watching Video and Focus Graph**  
   ![Watching Video and Focus Graph](#)  
   *Real-time graph updates and playback control.*

2. **Session Summary**  
   ![Final Analysis](#)  
   *Detailed analysis of the session, including focus intervals and overall statistics.*

3. **Application UI**  
   ![UI Overview](#)  
   *General UI showing user-friendly session controls and visualization.*

---

## How to Use
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the app at `http://localhost:3000` in your browser.

---

## Components Overview
### `SessionForm`
- Used to input session details, such as lecture title, YouTube URL, user name, and session mode.
- Validates YouTube video URLs.

### `VideoPlayer`
- Plays the selected YouTube video and tracks user gaze using **MediaPipe FaceMesh**.
- Generates real-time focus data and updates the focus graph.

### `Summary`
- Displays a detailed analysis of the session, including total focused time, unfocused intervals, and focus graphs.

### `Controls`
- Provides pause/resume and end session controls.

---

## Technologies Used
- **React**: For building the user interface.
- **Chart.js**: For rendering focus data as interactive bar charts.
- **MediaPipe FaceMesh**: For detecting user gaze and focus.
- **YouTube API**: For embedding and controlling video playback.

---

## Main Code Block
Here’s a quick reference for running the app locally:

```bash
git clone <repository-url>
cd <repository-name>
npm install
npm start
```

---

## Future Enhancements
1. Add multi-user support for collaborative focus tracking.
2. Integrate machine learning models for improved gaze detection.
3. Expand session customization options, such as session time limits.

---

## License
This project is licensed under the MIT License. 

Feel free to contribute and enhance! 🎉
