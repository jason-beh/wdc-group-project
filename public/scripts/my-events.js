document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#app",
    data() {
      return {
        attendedEvents: [],
        organizedEvents: [],
        currentView: "attendedEvents",
      };
    },
    methods: {
      loadAttendedEvents() {
        sendAJAX("GET", "/my-events/attended", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          console.log(res);

          app.attendedEvents = res;
        });
      },
      loadOrganisedEvents() {
        sendAJAX("GET", "/my-events/organized", null, function (err, res) {
          if (err) {
            // do something
            console.log(err);
          }

          res = JSON.parse(res);

          console.log(res);

          app.organizedEvents = res;
        });
      },
      switchView(view) {
        this.currentView = view;
      },
    },
    mounted() {
      this.loadAttendedEvents();
      this.loadOrganisedEvents();
    },
  });
});
