document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#signup-form",
    data() {
      return {
        email: "",
        password: "",
        confirm_password: "",
      };
    },
    methods: {
      onSubmit(e) {
        e.preventDefault();

        if (this.password !== this.confirm_password) {
          document.getElementsByClassName("authMessage")[0].innerText =
            "The passwords do not match.";
          this.password = "";
          this.confirm_password = "";
        } else {
          var formData = {
            email: this.email,
            password: this.password,
          };
          sendAJAX("POST", "/signup", JSON.stringify(formData), (err, res) => {
            if (err != null) {
              document.getElementsByClassName("authMessage")[0].innerText =
                err.message;
              this.password = "";
              this.confirm_password = "";
            } else {
              var clientEmail = res;
              window.location.href = `/verify-account?email=${clientEmail}`;
            }
          });
        }
      },
    },
  });
});
