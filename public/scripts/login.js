document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#wrapper",
    data() {
      return {
        email: "",
        password: "",
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
        document.getElementsByClassName("spinner-overlay")[0].style.display = "flex";
        var formData = {
          email: this.email,
          password: this.password,
        };
        sendAJAX("POST", "/login", JSON.stringify(formData), (err, res) => {
          setTimeout(function () {
            app.closeAlert();
            if (err !== null) {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              document.getElementsByClassName("spinner-overlay")[0].style.display = "none";
              document.getElementById("alert-error-text").innerHTML = err.message;
              document.getElementById("alert-error").style.display = "block";
              app.password = "";
            } else {
              document.getElementById("alert-success-text").innerText = "Login Success";
              document.getElementById("alert-success").style.display = "block";
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              document.getElementsByClassName("spinner-overlay")[0].style.display = "none";
              setTimeout(function () {
                res = JSON.parse(res);
                if (res.isAdmin === 1) {
                  window.location.href = "/admin";
                } else {
                  window.location.href = "/";
                }
              }, 1500);
            }
          }, 1500);
        });
      },
    },
  });
});

function sendVerificationEmail(email) {
  document.getElementsByClassName("spinner-overlay")[0].style.display = "flex";
  sendAJAX("GET", `/send-email?email=${email}&action=verify-account`, null, (err, res) => {
    let alertBars = document.getElementsByClassName("alert-bar");
    for (let alertBar of alertBars) {
      alertBar.style.display = "none";
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    document.getElementsByClassName("spinner-overlay")[0].style.display = "none";
    if (err !== null) {
      setTimeout(function () {
        document.getElementById("alert-error-text").innerHTML = err.message;
        document.getElementById("alert-error").style.display = "block";
      }, 1500);
    } else {
      let alertBars = document.getElementsByClassName("alert-bar");
      for (let alertBar of alertBars) {
        alertBar.style.display = "none";
      }
      document.getElementById("alert-success-text").innerText = "Verification email sent";
      document.getElementById("alert-success").style.display = "block";
    }
  });
}

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
