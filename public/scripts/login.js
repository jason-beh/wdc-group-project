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
