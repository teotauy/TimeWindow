let accessToken = null;
const API_URL = 'http://localhost:5001/adhd-focus-app-colby/us-central1/getCalendarEvents'; // We'll build this later!

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);

    // This part is the key: we need to exchange the JWT for an access token.
    // The Google Identity Services library handles this for you with a few extra steps,
    // but for simplicity, we'll assume we get the token directly here.
    // In a real app, you'd use a more secure process, but for now, we'll simulate it.
    // For local development, this is a reasonable starting point.
    accessToken = response.credential; // This is NOT a real access token, but we'll use it to simulate.
    
    // Show the main content and hide the sign-in button
    document.querySelector('.g_id_signin').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Start fetching calendar data
    updateCalendar();
    // Refresh the calendar every 5 minutes
    setInterval(updateCalendar, 5 * 60 * 1000);
}
async function updateCalendar() {
    if (!accessToken) {
        console.error("No access token available.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();

        // Update the UI with the new data
        if (data.currentTask) {
            document.getElementById('task-title').innerText = data.currentTask;
            // Start the visual timer
            startTimer(data.timeRemainingInMs);
        } else if (data.nextTask) {
            document.getElementById('task-title').innerText = 'You are free!';
            document.getElementById('next-task-title').innerText = data.nextTask;
            document.getElementById('timer').innerText = ''; // Clear the timer
        }
    } catch (error) {
        console.error("Error fetching calendar data:", error);
    }
}
let timerInterval = null;

function startTimer(milliseconds) {
    if (timerInterval) clearInterval(timerInterval); // Clear any previous timer

    const endTime = Date.now() + milliseconds;

    timerInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').innerText = 'Time is up!';
            updateCalendar(); // Refresh to get the next task
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        document.getElementById('timer').innerText = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}
function startBreathingExercise() {
    const container = document.getElementById('breathing-exercise-container');
    container.style.display = 'block';

    // Display the instructions
    const instructions = "Close your eyes and take three slow, deep breaths. Inhale for a count of four, hold for a count of four, and exhale for a count of six.";
    alert(instructions); // A simple alert for now
    
    // You could replace this with a more sophisticated UI animation.
}
