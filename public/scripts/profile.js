document.addEventListener("DOMContentLoaded", function () {
  // Load profile
  sendAJAX("GET", "/get-profile", null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    res = JSON.parse(res);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var query = urlParams.get("q");

    var app = new Vue({
      el: "#wrapper",
      data() {
        return {
          first_name: res.first_name,
          last_name: res.last_name,
          birthday: res.birthday !== null ? res.birthday.substring(0, 10) : "",
          instagram_handle: res.instagram_handle,
          facebook_handle: res.facebook_handle,
          state: res.state,
          country: res.country,
          profile_picture: res.profile_picture,
          query: query,
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

          let formData = new FormData();
          formData.append("first_name", this.first_name);
          formData.append("last_name", this.last_name);
          formData.append("birthday", this.birthday);
          formData.append("instagram_handle", this.instagram_handle);
          formData.append("facebook_handle", this.facebook_handle);
          formData.append("state", this.state);
          formData.append("country", this.country);
          if (e.target[8].files !== null && e.target[8].files.length > 0) {
            let file = e.target[8].files[0];
            formData.append("file", file);
          }

          sendFileAJAX("PUT", "/edit-profile", formData, function (err, res) {
            app.closeAlert();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            if (err) {
              console.log(err);
              document.getElementById("alert-error").style.display = "block";
              return;
            }

            document.getElementById("alert-success").style.display = "block";

            if (res != "") {
              res = JSON.parse(res);
              if (res.path !== null) {
                app.profile_picture = res.path;
              }
            }
          });
        },
      },
    });
  });
});
