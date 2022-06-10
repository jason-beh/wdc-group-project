sendAJAX("GET", "/get-session", null, function (err, res) {
  if (err) {
    return;
  }
  if (res !== "") {
    res = JSON.parse(res);
  } else {
    res = {
      profile_picture: null,
      isAdmin: -1,
    };
  }

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var query = urlParams.get("q");

  var app = new Vue({
    el: "#navbar",
    data() {
      return {
        profile_picture: res.profile_picture,
        isAdmin: res.isAdmin,
        query: query,
      };
    },
  });
});

function signOut() {
  // Delete session in backend
  sendAJAX("GET", "/logout", null, function (err, res) {
    if (err) {
      return;
    }

    // Log user out from google
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      window.location.href = "/login";
    });
  });
}
