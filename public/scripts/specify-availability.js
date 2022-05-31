document.addEventListener("DOMContentLoaded", function () {
  // Get event id from param
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");

  if (event_id === null) {
    alert("invalid event id");
    window.location.href = "/";
    return;
  }

  // Get event
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
      return;
    }

    res = JSON.parse(res);

    var app = new Vue({
      el: "#app",
      data() {
        return {
          event: {
            title: res.title,
            created_by: res.created_by,
            event_id: res.event_id,
            proposed_date: res.proposed_date,
            street_number: res.street_number,
            street_name: res.street_name,
            suburb: res.suburb,
            state: res.state,
            country: res.country,
            postcode: res.postcode,
            event_picture: res.event_picture,
            proposed_date: res.date,
          },
          email: "",
          selected_proposed_time_id: {},
          hasPreviouslySelected: false,
        };
      },
      methods: {
        loadPreviousAvailabilities(availabilityRes) {
          for (let availability of availabilityRes) {
            let { proposed_event_time_id } = availability;
            this.selected_proposed_time_id[proposed_event_time_id] = proposed_event_time_id;
          }

          // Retrigger state change
          let temp = this.selected_proposed_time_id;
          this.selected_proposed_time_id = {};
          this.selected_proposed_time_id = temp;
        },
        onClick(e) {
          let currentElem = e.target;
          let { id } = currentElem.dataset;

          if (id in this.selected_proposed_time_id) {
            currentElem.parentElement.classList.remove("selected");
            delete this.selected_proposed_time_id[id];
          } else {
            currentElem.parentElement.classList.add("selected");
            this.selected_proposed_time_id[id] = id;
          }
        },
        onSubmit(e) {
          e.preventDefault();
          var formData = {
            proposed_event_id: Object.values(this.selected_proposed_time_id),
            event_id: this.event.event_id,
            email: this.email,
          };
          sendAJAX(
            "POST",
            "/edit-availability",
            JSON.stringify(formData),
            function (err, availabilityRes) {
              if (err) {
                // do something
                console.log(err);
                return;
              }

              alert("success");

              console.log(availabilityRes);
            }
          );
        },
      },
    });

    // Check if user is logged in
    sendAJAX("GET", `/get-session`, null, function (err, userRes) {
      if (err) {
        // do something
        console.log(err);
        return;
      }

      userRes = JSON.parse(userRes);
      app.email = userRes.email;

      // disable the input if we are logged in and check for existing availability
      if (app.email != null) {
        document.getElementById("email-input").disabled = true;

        // Get current availability
        sendAJAX(
          "POST",
          `/get-availability`,
          JSON.stringify({ event_id: app.event.event_id }),
          function (err, availabilityRes) {
            if (err) {
              // do something
              console.log(err);
              return;
            }

            availabilityRes = JSON.parse(availabilityRes);

            app.loadPreviousAvailabilities(availabilityRes);
          }
        );
      }
    });

    document.getElementById("authorize_button").addEventListener("click", function () {
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          throw resp;
        }
        document.getElementById("authorize_button").innerText = "Sync Again";
        await listUpcomingEvents(res.proposed_date);
      };

      if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        tokenClient.requestAccessToken({ prompt: "" });
      }
    });
  });

  /*
    Sync Calendar Stuff
  */

  const CLIENT_ID = "507332350115-9kj93omegbtgu5hipcueuvpak2g7hm6g.apps.googleusercontent.com";
  const API_KEY = "AIzaSyAy3YteMve4LqH2DITNYS83zPsLGn5IFv4";
  const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;

  document.getElementById("authorize_button").style.visibility = "hidden";

  gapiLoaded();
  gisLoaded();

  function gapiLoaded() {
    gapi.load("client", intializeGapiClient);
  }

  async function intializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "", // defined later
    });
    gisInited = true;
    maybeEnableButtons();
  }

  function maybeEnableButtons() {
    if (gapiInited && gisInited) {
      document.getElementById("authorize_button").style.visibility = "visible";
    }
  }

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
      (str, event) =>
        `${str}${event.summary}: ${event.start.dateTime || event.start.date} - ${
          event.end.dateTime || event.end.date
        }\n`,
      `Finding all events based on the event's proposed date, ${today}: \n`
    );
    document.getElementById("content").innerText = output;
  }
});
