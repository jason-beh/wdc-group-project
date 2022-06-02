document.addEventListener("DOMContentLoaded", function () {
  let query = new URLSearchParams(window.location.search);
  let event_id = query.get("event");
  console.log(event_id);

  if (event_id === null) {
    alert("invalid event id");
    window.location.href = "/";
    return;
  }

  // Get event
  sendAJAX("GET", `/events/${event_id}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
      return;
    }

    res = JSON.parse(res);
    console.log(res);
    res.proposed_date = res.proposed_date !== null ? res.proposed_date.substring(0, 10) : "";
    var app = new Vue({
      el: "#eventDetail",
      data() {
        return {
          title: res.title,
          created_by: res.created_by,
          event_id: res.event_id,
          proposed_date: res.proposed_date,
          street_number: res.street_number,
          street_name: res.street_name,
          suburb: res.suburb,
          state: res.state,
          country: res.country,
          postcode: res.postcode,
          event_picture: res.event_picture,
          description: res.description,
        };
      },
    });
  });
});

// Copy link to clipboard
function copyClipboard() {
  navigator.clipboard.writeText(window.location.href);

  alert("Copied URL to clipboard! ");
}
