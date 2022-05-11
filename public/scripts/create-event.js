function addTimeSelect(e) {
  var newTimeSection = document.createElement("div");
  var timeList = document.getElementById("times");
  var newTime = document.createElement("input");
  newTime.type = "time";
  newTime.setAttribute("id", "1");
  newTime.addEventListener("change", function (e) {
    proposed_times.push(e.target.value);
    console.log(e.target.value);
  });
  var text = document.createElement("p");
  text.innerText = "Proposed Event Time : ";
  newTimeSection.appendChild(text);
  newTimeSection.appendChild(newTime);
  newTimeSection.setAttribute("class", "timeBox");
  timeList.appendChild(newTimeSection);
}

var proposed_times = [];
// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#create-form",
    data() {
      return {
        title: "",
        description: "",
        proposal_date: "",
        address_line: "",
        postcode: "",
        state: "",
        country: "",
        duration: "",
        proposed_times: "",
      };
    },
    methods: {
      onSubmit(e) {
        e.preventDefault();
        var formData = {
          title: res.title,
          description: res.description,
          proposal_date: res.proposal_date,
          address_line: res.address_line,
          postcode: res.postcode,
          state: res.state,
          country: res.country,
          duration: res.duration,
          proposed_times: res.proposed_times,
        };
        sendAJAX(
          "POST",
          "/create-event",
          JSON.stringify(formData),
          function (err, res) {
            // TODO: Notify user whether it fails or succeeds
          }
        );
      },
    },
  });
});
