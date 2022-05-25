// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  // Load profile
  sendAJAX("GET", "/get-events", null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    res = JSON.parse(res);

    if(res.length === 0) {
      let message = document.createElement('p');
      message.innerText = "There are no events available.";
      document.getElementById('eventsList').appendChild(message);
    }

    var app = new Vue({
      el: "#eventsList",
      data() {
        return {
          events: res,
        };
      },
    });
  });
});
