/**
 * A Cloud Function that retrieves the current and next calendar events
 * for the authenticated user.
 */
const { google } = require('googleapis');
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

exports.getCalendarEvents = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    // Check for Authorization header from the front-end
    if (!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) {
      console.error('No ID Token provided.');
      response.status(403).send('Unauthorized');
      return;
    }

    // Extract the access token from the header
    const idToken = request.headers.authorization.split('Bearer ')[1];
    
    // We'll use the ID Token to create an authenticated client for the Calendar API.
    // In a production app, you would verify this token with Google, but for
    // this simple app, we can use it to create an authenticated client.
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({access_token: idToken});

    // Initialize the Google Calendar API with the authenticated client
    const calendar = google.calendar({version: 'v3', auth: oauth2Client});

    // Set the time range for the search (now +/- a few hours)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    try {
      const calendarResponse = await calendar.events.list({
        calendarId: 'primary', // This retrieves events from the user's primary calendar
        timeMin: oneHourAgo.toISOString(),
        timeMax: endOfToday.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = calendarResponse.data.items;
      const responseData = {};
      let nextEventFound = false;

      // Find the current event and the next event
      for (const event of events) {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        // Check if the current time is within the event's duration
        if (now >= eventStart && now <= eventEnd) {
          // This is the current event
          const timeRemainingInMs = eventEnd.getTime() - now.getTime();
          responseData.currentTask = event.summary;
          responseData.timeRemainingInMs = timeRemainingInMs;
          
          // Look for the next event and break the loop
          for (let i = events.indexOf(event) + 1; i < events.length; i++) {
            if (new Date(events[i].start.dateTime) > now) {
              responseData.nextTask = events[i].summary;
              nextEventFound = true;
              break;
            }
          }
          break; // Stop checking events once a current one is found
        } else if (now < eventStart && !nextEventFound) {
          // This is the next upcoming event
          responseData.nextTask = event.summary;
          nextEventFound = true;
        }
      }

      // If no current or next task is found, handle that case
      if (!responseData.currentTask && !responseData.nextTask) {
        responseData.status = 'You are all clear for today!';
      }

      response.status(200).json(responseData);

    } catch (error) {
      console.error('Error fetching calendar events:', error);
      response.status(500).send('Error fetching calendar events.');
    }
  });
});
