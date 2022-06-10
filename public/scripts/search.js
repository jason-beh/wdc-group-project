document.addEventListener("DOMContentLoaded", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var query = urlParams.get("q");

  sendAJAX("GET", `/search?q=${query}`, null, function (err, res) {
    if (err) {
      return;
    }

    res = JSON.parse(res);

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

function truncate(str) {
  if (str !== null && str.length > 20) {
    return str.substring(0, 20).concat("...");
  }

  return str;
}
