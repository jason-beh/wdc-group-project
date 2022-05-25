sendAJAX("GET", "/get-session", null, function (err, res) {
  if (err) {
    // do something
    console.log(err);
  }

  if (res !== "") {
    res = JSON.parse(res);
  } else {
    res = {
      profile_picture: null,
    };
  }

  console.log(res);

  var app = new Vue({
    el: "#navbar",
    data() {
      return {
        profile_picture: res.profile_picture,
      };
    },
  });
});

function signOut() {
  // Delete session in backend
  sendAJAX("GET", "/logout", null, function (err, res) {
    if (err) {
      // do something
      console.log(err);
    }

    // Log user out from google
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      window.location.href = "/login";
    });
  });
}
