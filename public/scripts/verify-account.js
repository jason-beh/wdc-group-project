function resend() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var email = urlParams.get("email");
  sendAJAX("GET", `/send-email?email=${email}&action=verify-account`, null, function (err, res) {
    if (err) {
      console.log(err);
    }
  });
}
