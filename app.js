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
