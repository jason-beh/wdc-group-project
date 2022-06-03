// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  // Get event id from param
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");

  if (event_id === null) {
    alert("invalid event id");
    window.location.href = "/";
    return;
  }

  // Load profile
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    res = JSON.parse(res);

    var app = new Vue({
      el: "#edit-form",
      data() {
        return {
          title: res.title,
          description: res.description,
          street_number: res.street_number,
          street_name: res.street_name,
          suburb: res.suburb,
          postcode: res.postcode,
          state: res.state,
          country: res.country,
          event_picture: res.event_picture,
          event_id: res.event_id,
        };
      },
      methods: {
        onSubmit(e) {
          e.preventDefault();
          var formData = new FormData();
          formData.append("title", this.title);
          formData.append("description", this.description);
          formData.append("street_number", this.street_number);
          formData.append("street_name", this.street_name);
          formData.append("suburb", this.suburb);
          formData.append("postcode", this.postcode);
          formData.append("state", this.state);
          formData.append("country", this.country);
          formData.append("event_id", this.event_id);

          let file = e.target[9].files;
          if (file.length !== 0) {
            formData.append("file", file[0]);
          }
          sendFileAJAX("POST", "/edit-event", formData, (err, res) => {
            if (err) {
              console.log(err);
            }
            console.log(formData);
          });

          // sendAJAX("POST", "/edit-event", JSON.stringify(formData), function (err, res) {
          //   // TODO: Notify user whether it fails or succeeds
          // });
        },
      },
    });
  });
});
