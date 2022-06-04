document.addEventListener("DOMContentLoaded", function () {
  let query = new URLSearchParams(window.location.search);
  let email = query.get("email");
  let token = query.get("token");

  var app = new Vue({
    el: "#wrapper",
    data() {
      return {
        password: "",
        confirm_password: "",
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

        if (this.password !== this.confirm_password) {
          app.closeAlert();
          document.getElementById("alert-error-text").innerText = "The passwords do not match";
          document.getElementById("alert-error").style.display = "block";
          return;
        }

        let formData = {
          email: email,
          password: this.password,
          token: token,
        };

        sendAJAX("POST", "/reset-password", JSON.stringify(formData), function (err, res) {
          app.closeAlert();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
            return;
          }

          document.getElementById("alert-success").style.display = "block";
          app.password = "";
          app.confirm_password = "";
        });
      },
    },
  });
});
