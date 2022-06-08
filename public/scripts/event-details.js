document.addEventListener("DOMContentLoaded", function () {
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");

  if (event_id === null) {
    window.location.href = "/404";
    return;
  }

  var app = new Vue({
    el: "#eventDetail",
    data() {
      return {
        isCreator: "",
        title: "",
        created_by: "",
        event_id: "",
        proposed_date: "",
        street_number: "",
        street_name: "",
        suburb: "",
        state: "",
        country: "",
        postcode: "",
        event_picture: "",
        description: "",
        first_name: "",
        last_name: "",
        proposed_times: [],
        final_proposed_times: [],
        isFinalise: "",
        userEmail: "",
        final_selected_time_id: "",
        attendanceButton: "",
        radioChecker: "",
      };
    },
    methods: {
      closeAlert() {
        let alertBars = document.getElementsByClassName("alert-bar");
        for (let alertBar of alertBars) {
          alertBar.style.display = "none";
        }
      },
      loadProposedTime() {
        sendAJAX(
          "POST",
          "/get-proposed-time",
          JSON.stringify({ event_id: event_id }),
          function (err, res) {
            if (err) {
              document.getElementById("alert-error-text").innerText = err.message;
              document.getElementById("alert-error").style.display = "block";
            }

            let proposed_time = JSON.parse(res);
            for (let proposed_timing of proposed_time) {
              proposed_timing.start_date = getTime(proposed_timing.start_date);
              proposed_timing.end_date = getTime(proposed_timing.end_date);
            }
            app.proposed_times = proposed_time;
          }
        );
      },
      chooseFinaliseTime(e) {
        let currentElem = e.target;
        let radioContainers = document.getElementsByClassName("event-input-box");
        for (let radioContainer of radioContainers) {
          radioContainer.classList.remove("selected");
        }
        let finalSelectedTimeID = e.target.value;
        app.final_selected_time_id = finalSelectedTimeID;
        currentElem.parentElement.classList.add("selected");
      },
      finaliseTimeSubmit(e) {
        if (this.final_selected_time_id == "") {
          return;
        }

        sendAJAX(
          "POST",
          "/finalise-event-time",
          JSON.stringify({
            email: this.userEmail,
            event_id: this.event_id,
            proposed_event_time_id: this.final_selected_time_id,
          }),
          function (err, finaliseRes) {
            if (err) {
              document.getElementById("alert-error-text").innerText = err.message;
              document.getElementById("alert-error").style.display = "block";
            } else {
              document.getElementById("alert-success-text-final").innerText =
                "Successfully finalised the time!";
              document.getElementById("alert-success-final").style.display = "block";
              app.isFinalise = 1;
              sendAJAX(
                "POST",
                "/get-finalise-time",
                JSON.stringify({ finalise_event_time_id: app.final_selected_time_id }),
                function (err, finaltimeRes) {
                  if (err) {
                    document.getElementById("alert-error-text").innerText = err.message;
                    document.getElementById("alert-error").style.display = "block";
                  } else {
                    let final_proposed_time = JSON.parse(finaltimeRes);
                    final_proposed_time[0].start_date = getTime(final_proposed_time[0].start_date);
                    final_proposed_time[0].end_date = getTime(final_proposed_time[0].end_date);
                    app.final_proposed_times = final_proposed_time[0];
                  }
                  document.getElementById("dismiss-button3").click();
                }
              );
            }
          }
        );
      },
      confirmAttendance() {
        sendAJAX(
          "GET",
          `/confirm-attendance?email=${app.userEmail}&event_id=${app.event_id}`,
          null,
          function (err, attendRes) {
            if (err) {
              document.getElementById("alert-error-text").innerText = err.message;
              document.getElementById("alert-error").style.display = "block";
            } else {
              document.getElementById("alert-success-text-attend").innerText =
                "You have confirmed your attendance to this event !";
              document.getElementById("alert-success-attend").style.display = "block";
            }
            app.attendanceButton = false;
          }
        );
      },
    },
  });

  // Get event
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      document.getElementById("alert-error-text").innerText = err.message;
      document.getElementById("alert-error").style.display = "block";
      return;
    }

    res = JSON.parse(res);
    res.proposed_date = res.proposed_date !== null ? res.proposed_date.substring(0, 10) : "";
    app.title = res.title;
    app.created_by = res.created_by;
    app.event_id = res.event_id;
    app.proposed_date = res.proposed_date;
    app.street_number = res.street_number;
    app.street_name = res.street_name;
    app.suburb = res.suburb;
    app.state = res.state;
    app.country = res.country;
    app.postcode = res.postcode;
    app.event_picture = res.event_picture;
    app.description = res.description;
    app.isFinalise = res.finalized_event_time_id;
    app.first_name = res.first_name;
    app.last_name = res.last_name;
    sendAJAX("GET", "/get-session", null, function (err, userRes) {
      if (err) {
        //do something
        document.getElementById("alert-error-text").innerText = err.message;
        document.getElementById("alert-error").style.display = "block";
        return;
      }

      app.userEmail = JSON.parse(userRes).email;

      if (app.userEmail === res.created_by) {
        app.isCreator = true;
      } else {
        app.isCreator = false;
      }

      sendAJAX(
        "POST",
        "/get-attendance",
        JSON.stringify({ user_email: app.userEmail, event_id: app.event_id }),
        function (err, attendanceRes) {
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
          }
          attendanceRes = JSON.parse(attendanceRes);
          if (attendanceRes.length == 0) {
            app.attendanceButton = true;
          } else {
            app.attendanceButton = false;
          }
        }
      );
    });
    if (app.isFinalise != null) {
      sendAJAX(
        "POST",
        "/get-finalise-time",
        JSON.stringify({ finalise_event_time_id: app.isFinalise }),
        function (err, finaltimeRes) {
          if (err) {
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
          } else {
            let final_proposed_time = JSON.parse(finaltimeRes);
            final_proposed_time[0].start_date = getTime(final_proposed_time[0].start_date);
            final_proposed_time[0].end_date = getTime(final_proposed_time[0].end_date);
            app.final_proposed_times = final_proposed_time[0];
            // console.log("finalfinal == " + app.final_proposed_times.start_date);
          }
        }
      );
    }
  });
});

// get time from given date
function getTime(datetime) {
  if (datetime !== null) {
    return datetime.substring(11, 19);
  }

  return "";
}

// Copy link to clipboard
function copyClipboard() {
  navigator.clipboard.writeText(window.location.href);
  document.getElementById("alert-success-text-attend").innerText = "Copied to clipboard !";
  document.getElementById("alert-success-attend").style.display = "block";
}
