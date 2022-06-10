const urlParams = new URLSearchParams(window.location.search);
var email = urlParams.get("email");

if (email === null) {
  window.location.href = "/404";
}

function resend() {
  sendAJAX("GET", `/send-email?email=${email}&action=verify-account`, null, function (err, res) {
    if (err) {
      return;
    }
  });
}
