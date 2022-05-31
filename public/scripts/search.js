// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var query = urlParams.get("q");

  // Load profile
  sendAJAX("GET", `/search?q=${query}`, null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    res = JSON.parse(res);

    console.log(res);

    var app = new Vue({
      el: "#app",
      data() {
        return {
          events: res,
          query: query,
        };
      },
    });
  });
});
