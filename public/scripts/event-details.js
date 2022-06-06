document.addEventListener("DOMContentLoaded", function () {
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");
  console.log(event_id);
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
        proposed_times: [],
        final_proposed_times: [],
        isFinalise: "",
        userEmail: "",
        final_selected_time: "",
        attendanceButton: "",
      };
    },
    methods: {
      finaliseTime() {
        sendAJAX(
          "POST",
          "/get-proposed-time",
          JSON.stringify({ event_id: event_id }),
          function (err, res) {
            if (err) {
              // something ?
              console.log(err);
            }

            proposed_time = JSON.parse(res);
            for (let proposed_timing of proposed_time) {
              proposed_timing.start_date =
                proposed_timing.start_date !== null
                  ? proposed_timing.start_date.substring(11, 19)
                  : "";
              proposed_timing.end_date =
                proposed_timing.end_date !== null ? proposed_timing.end_date.substring(11, 19) : "";
            }
            app.proposed_times = proposed_time;
            console.log(app.proposed_times);
          }
        );
      },

      finalClick(e) {
        let finalSelectedTimeID = e.target.value;
        app.final_selected_time_id = finalSelectedTimeID;
        console.log(app.final_selected_time_id);
      },
      finalising(e) {
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
              console.log(err);
            } else {
              app.isFinalise = 1;
              console.log("final time = " + app.final_selected_time_id);
              sendAJAX(
                "POST",
                "/get-finalise-time",
                JSON.stringify({ finalise_event_time_id: app.final_selected_time_id }),
                function (err, finaltimeRes) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(JSON.parse(finaltimeRes));
                    final_proposed_time = JSON.parse(finaltimeRes);
                    final_proposed_time[0].start_date =
                      final_proposed_time[0].start_date !== null
                        ? final_proposed_time[0].start_date.substring(11, 19)
                        : "";
                    final_proposed_time[0].end_date =
                      final_proposed_time[0].end_date !== null
                        ? final_proposed_time[0].end_date.substring(11, 19)
                        : "";
                    app.final_proposed_times = final_proposed_time[0];
                    // console.log("finalfinal == " + app.final_proposed_times.start_date);
                  }
                }
              );
            }
          }
        );
      },
      confirmAttendance() {
        sendAJAX(
          "POST",
          "/confirm-attendance",
          JSON.stringify({ user_email: app.userEmail, event_id: app.event_id }),
          function (err, attendRes) {
            if (err) {
              console.log(err);
            }
            app.attendanceButton = false;
            console.log(attendRes);
            console.log(app.attendanceButton);
          }
        );
      },
    },
  });

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
    console.log(res);
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
    console.log("finalised = " + app.isFinalise);
    console.log(app.title);
    sendAJAX("GET", "/get-session", null, function (err, userRes) {
      if (err) {
        //do something
        console.log(err);
        return;
      }

      app.userEmail = JSON.parse(userRes).email;
      console.log(app.userEmail);

      if (app.userEmail === res.created_by) {
        app.isCreator = true;
        console.log("creator = " + app.isCreator);
      } else {
        app.isCreator = false;
        console.log("creator = " + app.isCreator);
      }
      console.log(app.userEmail);
      sendAJAX(
        "POST",
        "/get-attendance",
        JSON.stringify({ user_email: app.userEmail, event_id: app.event_id }),
        function (err, attendanceRes) {
          if (err) {
            console.log(err);
          }
          var attendanceRes = JSON.parse(attendanceRes);
          console.log(attendanceRes);
          console.log(attendanceRes.length);
          if (attendanceRes.length == 0) {
            app.attendanceButton = true;
          } else {
            app.attendanceButton = false;
          }
          console.log(app.attendanceButton);
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
            console.log(err);
          } else {
            console.log(JSON.parse(finaltimeRes));
            final_proposed_time = JSON.parse(finaltimeRes);
            final_proposed_time[0].start_date =
              final_proposed_time[0].start_date !== null
                ? final_proposed_time[0].start_date.substring(11, 19)
                : "";
            final_proposed_time[0].end_date =
              final_proposed_time[0].end_date !== null
                ? final_proposed_time[0].end_date.substring(11, 19)
                : "";
            app.final_proposed_times = final_proposed_time[0];
            // console.log("finalfinal == " + app.final_proposed_times.start_date);
          }
        }
      );
    }
  });
});

// Copy link to clipboard
function copyClipboard() {
  navigator.clipboard.writeText(window.location.href);

  alert("Copied URL to clipboard! ");
}
