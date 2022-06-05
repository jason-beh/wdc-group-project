document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#wrapper",
    data() {
      return {
        email: "",
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

        let formData = {
          email: this.email,
        };

        sendAJAX("POST", "/forget-password", JSON.stringify(formData), function (err, res) {
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
        });
      },
    },
  });
});
