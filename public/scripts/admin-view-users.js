document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#admin-table",
    data() {
      return {
        users: "",
        currentEmail: "",
        first_name: "",
        last_name: "",
        birthday: "",
        instagram_handle: "",
        facebook_handle: "",
        state: "",
        country: "",
        profile_picture: "",
        userEmail: "",
        userPassword: "",
      };
    },
    methods: {
      closeAlert() {
        let alertBars = document.getElementsByClassName("alert-bar");
        for (let alertBar of alertBars) {
          alertBar.style.display = "none";
        }
      },
      viewUsers() {
        // Load profile
        sendAJAX("GET", "/admin/view-users", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          for (let user of res) {
            user.birthday = user.birthday !== null ? user.birthday.substring(0, 10) : "";
          }

          app.users = res;
        });
      },

      setToDelete(e) {
        this.currentEmail = e.target.dataset.email;
      },
      confirmDelete() {
        sendAJAX(
          "DELETE",
          "/admin/delete-user",
          JSON.stringify({ email: this.currentEmail }),
          function (err, res) {
            app.closeAlert();
            document.getElementById("dismiss-button-1").click();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            if (err) {
              console.log(err);
              document.getElementById("alert-error-text").innerText = err.message;
              document.getElementById("alert-error").style.display = "block";
            } else {
              document.getElementById("alert-success-text").innerText = "Successfully deleted user";
              document.getElementById("alert-success").style.display = "block";
              app.viewUsers();
            }
          }
        );
      },
      getCurrentUser(e) {
        this.currentEmail = e.target.dataset.email;
        sendAJAX(
          "POST",
          "/admin/get-profile",
          JSON.stringify({ email: this.currentEmail }),
          function (err, res) {
            if (err) {
              console.log(err);
            }
            res = JSON.parse(res);
            app.first_name = res.first_name;
            app.last_name = res.last_name;
            app.birthday = res.birthday !== null ? res.birthday.substring(0, 10) : "";
            app.instagram_handle = res.instagram_handle;
            app.facebook_handle = res.facebook_handle;
            app.state = res.state;
            app.country = res.country;
            app.profile_picture = res.profile_picture;
          }
        );
      },
      onSubmit(e) {
        e.preventDefault();
        var formData = {
          email: this.currentEmail,
          first_name: this.first_name,
          last_name: this.last_name,
          birthday: this.birthday,
          instagram_handle: this.instagram_handle,
          facebook_handle: this.facebook_handle,
          state: this.state,
          country: this.country,
        };
        sendAJAX("POST", "/admin/edit-profile", JSON.stringify(formData), function (err, res) {
          app.closeAlert();
          document.getElementById("dismiss-button-2").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
          } else {
            document.getElementById("alert-success-text").innerText =
              "Successfully updated profile";
            document.getElementById("alert-success").style.display = "block";
            app.viewUsers();
          }
        });
      },
      createSystemAdmin(e) {
        e.preventDefault();
        var formData = {
          email: this.userEmail,
          password: this.userPassword,
        };
        sendAJAX("POST", "/admin/create-admin", JSON.stringify(formData), function (err, res) {
          app.closeAlert();
          document.getElementById("dismiss-button3").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
          } else {
            document.getElementById("alert-success-text").innerText =
              "Successfully created system admin";
            document.getElementById("alert-success").style.display = "block";
            app.userEmail = "";
            app.userPassword = "";
            app.viewUsers();
          }
        });
      },
      createUser(e) {
        e.preventDefault();
        var formData = {
          email: this.userEmail,
          password: this.userPassword,
        };
        sendAJAX("POST", "/admin/create-user", JSON.stringify(formData), function (err, res) {
          app.closeAlert();
          document.getElementById("dismiss-button4").click();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = err.message;
            document.getElementById("alert-error").style.display = "block";
          } else {
            document.getElementById("alert-success-text").innerText = "Successfully created user";
            document.getElementById("alert-success").style.display = "block";
            app.userEmail = "";
            app.userPassword = "";
            app.viewUsers();
          }
        });
      },
    },

    mounted() {
      this.viewUsers();
    },
  });
});

function truncate(str) {
  if (str != null && str.length > 20) {
    return str.substring(0, 20).concat("...");
  }

  return str;
}
