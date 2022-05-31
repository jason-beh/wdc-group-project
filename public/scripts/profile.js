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
        onSubmit(e) {
          e.preventDefault();
          var formData = {
            first_name: this.first_name,
            last_name: this.last_name,
            birthday: this.birthday,
            instagram_handle: this.instagram_handle,
            facebook_handle: this.facebook_handle,
            state: this.state,
            country: this.country,
          };
          sendAJAX("POST", "/edit-profile", JSON.stringify(formData), function (err, res) {
            // TODO: Notify user whether it fails or succeeds
          });
        },
        changeProfilePicture(e) {
          e.preventDefault();
          let file = e.target[0].files[0];
          var formData = new FormData();
          formData.append("file", file);

          sendFileAJAX("POST", "/change-profile-image", formData, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              this.profile_picture = res;
            }
          });
        },
        onUploadFile() {
          this.changeProfilePicture();
        },
      },
    });
  });
});
