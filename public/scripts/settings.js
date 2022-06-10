document.addEventListener("DOMContentLoaded", function () {
  // Load Notifications Settings
  sendAJAX("GET", "/get-settings", null, function (err, res) {
    if (err) {
      return;
    }

    res = JSON.parse(res);

    var app = new Vue({
      el: "#wrapper",
      data() {
        return {
          is_event_finalised: res["is_event_finalised"] === 1,
          is_event_cancelled: res["is_event_cancelled"] === 1,
          is_availability_confirmed: res["is_availability_confirmed"] === 1,
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
          var formData = {
            is_event_finalised: this.is_event_finalised,
            is_event_cancelled: this.is_event_cancelled,
            is_availability_confirmed: this.is_availability_confirmed,
          };
          sendAJAX("PUT", "/edit-settings", JSON.stringify(formData), function (err, res) {
            app.closeAlert();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            if (err) {
              document.getElementById("alert-error").style.display = "block";
              return;
            }

            document.getElementById("alert-success").style.display = "block";
          });
        },
      },
    });
  });
});
