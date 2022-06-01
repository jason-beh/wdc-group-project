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
      viewUsers() {
        // Load profile
        sendAJAX("GET", "/view-users", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          console.log(res);
          for (user of res) {
            user.birthday = user.birthday !== null ? user.birthday.substring(0, 10) : "";
          }
          app.users = res;
        });
      },

      setToDelete(e) {
        this.currentEmail = e.target.dataset.email;
        console.log(this.currentEmail);
      },
      confirmDelete(e) {
        sendAJAX(
          "POST",
          "/delete-user",
          JSON.stringify({ email: this.currentEmail }),
          function (err, res) {
            if (err) {
              console.log(err);
            } else {
              app.viewUsers();
              alert("Succesfully deleted user !");
            }
            // TODO: Notify user whether it fails or succeeds
          }
        );
      },
      getCurrentUser(e) {
        this.currentEmail = e.target.dataset.email;
        console.log(this.currentEmail);
        sendAJAX(
          "POST",
          "/get-profile-admin",
          JSON.stringify({ emailToSearch: this.currentEmail }),
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
        sendAJAX("POST", "/admin-edit-profile", JSON.stringify(formData), function (err, res) {
          if (err) {
            console.log(err);
          } else {
            app.viewUsers();
            alert("Successfully updated profile !");
          }
          // TODO: Notify user whether it fails or succeeds
        });
      },
      createSystemAdmin(e) {
        e.preventDefault();
        var formData = {
          email: this.userEmail,
          password: this.userPassword,
        };
        sendAJAX("POST", "/create-admin", JSON.stringify(formData), function (err, res) {
          if (err) {
            console.log(err);
          } else {
            alert("Successfully created admin !");
            app.userEmail = "";
            app.userPassword = "";
            app.viewUsers();
          }
          // TODO: Notify user whether it fails or succeeds
        });
      },
      createSystemUser(e) {
        e.preventDefault();
        var formData = {
          email: this.userEmail,
          password: this.userPassword,
        };
        sendAJAX("POST", "/create-user", JSON.stringify(formData), function (err, res) {
          if (err) {
            console.log(err);
          } else {
            alert("Successfully created user !");
            app.userEmail = "";
            app.userPassword = "";
            app.viewUsers();
          }
          // TODO: Notify user whether it fails or succeeds
        });
      },
    },

    mounted() {
      this.viewUsers();
    },
  });
});
