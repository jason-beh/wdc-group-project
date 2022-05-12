sendAJAX("GET", "/get-session", null, function (err, res) {
  if (err) {
    // do something
    console.log(err);
  }

  var res = JSON.parse(res);

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
