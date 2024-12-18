# Focus Session Analyzer

The **Focus Session Analyzer** is a React-based web application designed to track and analyze a user's focus while watching a YouTube video. Using **MediaPipe FaceMesh**, the app detects user gaze to determine focus levels and provides real-time visualizations along with a detailed session summary.


## Try It Now!
[Click here now to try our app](https://the-jar-team.github.io/Analyze-Watching/)
[![Enjoy](https://i.imgur.com/mBfVZ5g.png)](https://the-jar-team.github.io/Analyze-Watching/)
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

1. **Watching Video and Focus Graph**  
   ![Watching Video and Focus Graph](https://i.imgur.com/JpG41hA.png)  
   *Real-time graph updates and playback control.*

2. **Session Summary**  
   ![Final Analysis](https://i.imgur.com/KLedGGb.png)  
   *Detailed analysis of the session, including focus intervals and overall statistics.*

3. **Application UI**  
   ![UI Overview](https://imgur.com/cAUcqlg.png)  
   ![UI Overview](https://i.imgur.com/yPWURa6.png)  
   *General UI showing user-friendly session controls and visualization.*
4. **JSON Data**
   ![Copy Data To JSON](https://i.imgur.com/BkEfDM4.png)  
   *JSON Data*


---

## How to Use
1. Clone the repository:
   ```bash
   git clone https://github.com/The-JAR-Team/Analyze-Watching.git
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
git clone https://github.com/The-JAR-Team/Analyze-Watching.git
npm install
npm start
```

---

## Future Enhancements
1. Secret for now :)

---

