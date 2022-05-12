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

  var app = new Vue({
    el: "#navbar",
    data() {
      return {
        profile_picture: res.profile_picture,
      };
    },
  });
});
