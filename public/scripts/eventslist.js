// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  // Load profile
  sendAJAX("GET", "/view-events", null, function (err, res) {
    // if (err) {
    //   // do something
    //   console.log(err);
    // }

    var res = {
      events: [
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
        {
          title: "Test",
          proposed_date: "16 May 2022",
          created_by: "John",
          street_name: "Unilodge City Gardens",
          event_picture: "Test",
          event_picture: "/images/exampleProfile.png",
        },
      ],
    };
    var app = new Vue({
      el: "#eventsList",
      data() {
        return {
          events: res.events,
        };
      },
    });
  });
});
