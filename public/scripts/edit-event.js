document.addEventListener("DOMContentLoaded", function () {
  // Get event id from param
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");

  if (event_id === null) {
    window.location.href = "/404";
    return;
  }

  // Load profile
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    // TODO: Check if it is valid event id and its editable by the current user

    res = JSON.parse(res);

    console.log(res);

    var app = new Vue({
      el: "#wrapper",
      data() {
        return {
          title: res.title,
          description: res.description,
          street_number: res.street_number,
          street_name: res.street_name,
          suburb: res.suburb,
          postcode: res.postcode,
          state: res.state,
          country: res.country,
          event_picture: res.event_picture,
          event_id: res.event_id,
        };
      },
      methods: {
        closeAlert() {
          let alertBars = document.getElementsByClassName("alert-bar");
          for (let alertBar of alertBars) {
            alertBar.style.display = "none";
          }
        },
        onSubmit(e) {
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
          formData.append("event_id", this.event_id);

          let file = e.target[9].files;
          if (file.length !== 0) {
            formData.append("file", file[0]);
          }
          sendFileAJAX("POST", "/edit-event", formData, (err, res) => {
            app.closeAlert();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            if (err) {
              console.log(err);
              document.getElementById("alert-error-text").innerText = err.message;
              document.getElementById("alert-error").style.display = "block";
            } else {
              document.getElementById("alert-success-text").innerText = "Successfully edited event";
              document.getElementById("alert-success").style.display = "block";
              setTimeout(function () {
                window.location.href = `/event-details?event=${app.event_id}`;
              }, 1500);
            }
          });
        },
      },
    });
  });
});
