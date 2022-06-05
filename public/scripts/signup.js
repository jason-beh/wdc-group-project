document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#wrapper",
    data() {
      return {
        email: "",
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
          document.getElementById("alert-error-text").innerText = "The passwords don't match";
          document.getElementById("alert-error").style.display = "block";
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          this.password = "";
          this.confirm_password = "";
        } else {
          document.getElementsByClassName("spinner-overlay")[0].style.display = "flex";

          var formData = {
            email: this.email,
            password: this.password,
          };
          sendAJAX("POST", "/signup", JSON.stringify(formData), (err, res) => {
            if (err !== null) {
              setTimeout(function () {
                app.closeAlert();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
                document.getElementsByClassName("spinner-overlay")[0].style.display = "none";
                document.getElementById("alert-error-text").innerText = err.message;
                document.getElementById("alert-error").style.display = "block";
                app.password = "";
                app.confirm_password = "";
              }, 1500);
            } else {
              app.closeAlert();
              document.getElementById("alert-success").style.display = "block";
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              document.getElementsByClassName("spinner-overlay")[0].style.display = "none";
              setTimeout(function () {
                var clientEmail = res;
                window.location.href = `/verify-account?email=${clientEmail}`;
              }, 1500);
            }
          });
        }
      },
    },
  });
});

function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  var oAuthData = {
    token: id_token,
  };
  sendAJAX("POST", "/oauth", JSON.stringify(oAuthData), (err, res) => {
    if (err !== null) {
      document.getElementsByClassName("authMessage")[0].innerText = err.message;
      this.password = "";
    } else {
      // Revoke permission to allow user to choose other emails to sign in with google, in the future
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.disconnect();
      // Redirect
      window.location.href = "/";
    }
  });
}
