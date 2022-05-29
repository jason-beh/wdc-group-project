document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#login-form",
    data() {
      return {
        email: "",
        password: "",
      };
    },
    methods: {
      onSubmit(e) {
        e.preventDefault();
        var formData = {
          email: this.email,
          password: this.password,
        };
        sendAJAX("POST", "/login", JSON.stringify(formData), (err, res) => {
          if (err != null) {
            document.getElementsByClassName("authMessage")[0].innerText = err.message;
            this.password = "";
          } else {
            // Redirect
            window.location.href = "/";
          }
        });
      },
    },
  });
});

function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  var oAuthData = {
    token: id_token
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
