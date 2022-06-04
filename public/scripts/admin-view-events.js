document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#admin-table-events",
    data() {
      return {
        events: "",
        eventID: "",
        title: "",
        description: "",
        proposed_date: "",
        street_number: "",
        street_name: "",
        state: "",
        country: "",
        suburb: "",
        postcode: "",
        event_picture: "",
        duration: 0,
        proposed_times: {},
      };
    },
    methods: {
      closeAlert() {
        let alertBars = document.getElementsByClassName("alert-bar");
        for (let alertBar of alertBars) {
          alertBar.style.display = "none";
        }
      },
      viewEvents() {
        // Load profile
        sendAJAX("GET", "/admin/view-events", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          for (let singleEvent of res) {
            singleEvent.proposed_date =
              singleEvent.proposed_date !== null ? singleEvent.proposed_date.substring(0, 10) : "";
          }
          app.events = res;
        });
      },

      setToDelete(e) {
        this.eventID = e.target.dataset.eventid;
      },
      confirmDelete(e) {
        sendAJAX(
          "DELETE",
          "/admin/delete-event",
          JSON.stringify({ eventID: this.eventID }),
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
              app.viewEvents();
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
          "/admin/get-event",
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
      onEdit(e) {
        e.preventDefault();
        var formData = new FormData();
        formData.append("title", this.title);
        formData.append("description", this.description);
        formData.append("street_number", this.street_number);
        formData.append("street_name", this.street_name);
        formData.append("suburb", this.suburb);
        formData.append("postcode", this.postcode);
        formData.append("state", this.state);
        formData.append("country", this.country);
        formData.append("event_id", this.eventID);

        let file = e.target[9].files;
        if (file.length !== 0) {
          formData.append("file", file[0]);
        }

        sendFileAJAX("POST", "/admin/edit-event", formData, (err, res) => {
          app.closeAlert();
          document.getElementById("dismiss-button2").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = "Error updating event";
            document.getElementById("alert-error").style.display = "block";
          } else {
            document.getElementById("alert-success-text").innerText = "Successfully updated event";
            document.getElementById("alert-success").style.display = "block";
            app.viewEvents();
          }
        });
      },
      onCreate(e) {
        e.preventDefault();
        if (Object.values(this.proposed_times).length == 0) {
          alert("Please add at least one proposed start time !");
          return;
        }
        var formData = new FormData();
        formData.append("title", this.title);
        formData.append("description", this.description);
        formData.append("proposed_date", this.proposed_date);
        formData.append("street_number", this.street_number);
        formData.append("street_name", this.street_name);
        formData.append("suburb", this.suburb);
        formData.append("state", this.state);
        formData.append("country", this.country);
        formData.append("postcode", this.postcode);
        formData.append("duration", this.duration);
        formData.append("proposed_times", Object.values(this.proposed_times));

        let file = e.target[10].files[0];
        formData.append("file", file);

        sendFileAJAX("POST", "/create-event", formData, function (err, res) {
          app.closeAlert();
          document.getElementById("dismiss-button").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = "Error creating event";
            document.getElementById("alert-error").style.display = "block";
          } else {
            document.getElementById("alert-success-text").innerText = "Successfully creating event";
            document.getElementById("alert-success").style.display = "block";
            app.viewEvents();
          }
        });
      },
      addTimeSelect(e) {
        e.preventDefault();

        var id = Date.now();
        var timeList = document.getElementById("times");

        var newTimeSection = document.createElement("div");
        newTimeSection.setAttribute("class", "time-box");

        var newTime = document.createElement("input");
        newTime.type = "time";
        newTime.required = true;
        newTime.setAttribute("data-id", id);
        newTime.addEventListener("change", (event) => {
          event.preventDefault();
          let id = event.target.dataset.id;
          this.proposed_times[id] = event.target.value;
        });

        var text = document.createElement("p");
        text.innerText = "Proposed Event Time: ";

        var icon = document.createElement("ion-icon");
        icon.setAttribute("name", "close-outline");
        icon.setAttribute("data-id", id);
        icon.addEventListener("click", (event) => {
          event.preventDefault();
          let id = event.target.dataset.id;

          delete this.proposed_times[id];

          newTimeSection.remove();
        });

        newTimeSection.appendChild(text);
        newTimeSection.appendChild(newTime);
        newTimeSection.appendChild(icon);

        timeList.appendChild(newTimeSection);
      },
    },
    mounted() {
      this.viewEvents();
    },
  });
  document.getElementById("add-start-time-button").click();
});

function truncate(str) {
  if (str != null && str.length > 20) {
    return str.substring(0, 20).concat("...");
  }

  return str;
}
