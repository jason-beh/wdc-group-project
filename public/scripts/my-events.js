document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#app",
    data() {
      return {
        attendedEvents: [],
        organizedEvents: [],
        currentView: "attendedEvents",
        eventID: "",
      };
    },
    methods: {
      closeAlert() {
        let alertBars = document.getElementsByClassName("alert-bar");
        for (let alertBar of alertBars) {
          alertBar.style.display = "none";
        }
      },
      loadAttendedEvents() {
        sendAJAX("GET", "/my-events/attended", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          console.log(res);

          app.attendedEvents = res;
        });
      },
      loadOrganisedEvents() {
        sendAJAX("GET", "/my-events/organized", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          console.log(res);

          app.organizedEvents = res;
        });
      },
      switchView(view) {
        this.currentView = view;
      },
      setToDelete(e) {
        this.eventID = e.target.dataset.eventid;
      },
      confirmDelete(e) {
        sendAJAX(
          "DELETE",
          "/delete-event",
          JSON.stringify({ event_id: this.eventID }),
          function (err, res) {
            app.closeAlert();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            if (err) {
              console.log(err);
              document.getElementById("alert-error-text").innerText = "Error deleting event";
              document.getElementById("alert-error").style.display = "block";
            } else {
              document.getElementById("alert-success-text").innerText =
                "Successfully deleted event";
              document.getElementById("alert-success").style.display = "block";
              app.loadAttendedEvents();
              app.loadOrganisedEvents();
            }
          }
        );
      },
      clearCurrentEvent(e) {
        app.title = "";
        app.description = "";
        app.proposed_date = "";
        app.street_number = "";
        app.street_name = "";
        app.state = "";
        app.country = "";
        app.suburb = "";
        app.postcode = "";
        app.event_picture = "";
      },
      getCurrentEvent(e) {
        this.eventID = e.target.dataset.eventid;
        sendAJAX(
          "POST",
          "/get-event",
          JSON.stringify({ eventToSearch: this.eventID }),
          function (err, res) {
            if (err) {
              console.log(err);
            }
            res = JSON.parse(res);
            app.title = res.title;
            app.description = res.description;
            app.proposed_date =
              app.proposed_date !== null ? app.proposed_date.substring(0, 10) : "";
            app.street_number = res.street_number;
            app.street_name = res.street_name;
            app.state = res.state;
            app.country = res.country;
            app.suburb = res.suburb;
            app.postcode = res.postcode;
            app.event_picture = res.event_picture;
          }
        );
      },
    },
    mounted() {
      this.loadAttendedEvents();
      this.loadOrganisedEvents();
    },
  });
});

function truncate(str) {
  if (str !== null && str.length > 20) {
    return str.substring(0, 20).concat("...");
  }

  return str;
}
