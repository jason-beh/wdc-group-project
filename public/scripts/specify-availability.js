document.addEventListener("DOMContentLoaded", function () {
  // Get event id from param
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");

  if (event_id === null) {
    alert("invalid event id");
    window.location.href = "/";
  }

  // Get event
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
      return;
    }

    res = JSON.parse(res);

    // TODO: Populate event details + proposed_times
    document.getElementById("event_content").innerHTML = JSON.stringify(res, null, 4);

    /**
     *  Sign in the user upon button click.
     */
    document.getElementById('authorize_button').addEventListener('click', function() {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw resp;
            }
            document.getElementById("authorize_button").innerText = "Refresh";
            await listUpcomingEvents(res.proposed_date);
        };

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({ prompt: "consent" });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({ prompt: "" });
        }
    })
  });

    /*
     Sync Calendar Stuff
    */

    const CLIENT_ID = "";
    const API_KEY = "";
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
    const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

    let tokenClient;
    let gapiInited = false;
    let gisInited = false;

    document.getElementById("authorize_button").style.visibility = "hidden";

    gapiLoaded();
    gisLoaded();

    /**
     * Callback after api.js is loaded.
     */
    function gapiLoaded() {
        gapi.load("client", intializeGapiClient);
    }

    /**
     * Callback after the API client is loaded. Loads the
     * discovery doc to initialize the API.
     */
    async function intializeGapiClient() {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
    }

    /**
     * Callback after Google Identity Services are loaded.
     */
    function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: "", // defined later
        });
        gisInited = true;
        maybeEnableButtons();
    }

    /**
     * Enables user interaction after all libraries are loaded.
     */
    function maybeEnableButtons() {
        if (gapiInited && gisInited) {
            document.getElementById("authorize_button").style.visibility = "visible";
        }
    }

    /**
     * Print the summary and start datetime/date of the next ten events in
     * the authorized user's calendar. If no events are found an
     * appropriate message is printed.
     */
    async function listUpcomingEvents(date) {
        let response;

        let today = new Date(date);
        let tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);

        try {
            const request = {
                calendarId: "primary",
                timeMin: today.toISOString(),
                timeMax: tomorrow.toISOString(),
                showDeleted: false,
                singleEvents: true,
                orderBy: "startTime",
            };
            response = await gapi.client.calendar.events.list(request);
        } catch (err) {
            document.getElementById("content").innerText = err.message;
            return;
        }

        const events = response.result.items;
        if (!events || events.length == 0) {
            document.getElementById("content").innerText = "No events found.";
            return;
        }
        // Flatten to string to display
        const output = events.reduce(
            (str, event) => `${str}${event.summary}: ${event.start.dateTime || event.start.date} - ${event.end.dateTime || event.end.date}\n`,
            `Finding all events based on the event's proposed date, ${today}: \n`
        );
        document.getElementById("content").innerText = output;
    }

});