// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#create-form",
    data() {
      return {
        title: "",
        description: "",
        proposed_date: Date.now(),
        street_number: "",
        street_name: "",
        suburb: "",
        state: "",
        country: "",
        postcode: "",
        duration: 0,
        proposed_times: [],
      };
    },
    methods: {
      onSubmit(e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append("title", this.title);
        formData.append("description", this.description);
        formData.append("proposed_date", this.proposed_date);
        formData.append("street_number", this.street_number);
        formData.append("street_name", this.street_name);
        formData.append("suburb", this.suburb);
        formData.append("state", this.state);
        formData.append("country", this.country);
        formData.append("postcode", this.postcode);
        formData.append("duration", this.duration);
        formData.append("proposed_times", this.proposed_times);

        console.log(e);
        console.log(e.target);

        let file = e.target[10].files[0];
        formData.append("file", file);

        sendFileAJAX("POST", "/create-event", formData, function (err, res) {
          // TODO: Notify user whether it fails or succeeds
        });
      },
      addTimeSelect(e) {
        e.preventDefault();
        var newTimeSection = document.createElement("div");
        var timeList = document.getElementById("times");

        var newTime = document.createElement("input");
        newTime.type = "time";
        newTime.setAttribute("id", this.proposed_times.length++);
        newTime.addEventListener("change", (event) => {
          event.preventDefault();
          this.proposed_times[event.target.id] = event.target.value;
        });

        var text = document.createElement("p");
        text.innerText = "Proposed Event Time : ";
        newTimeSection.appendChild(text);
        newTimeSection.appendChild(newTime);
        newTimeSection.setAttribute("class", "timeBox");
        timeList.appendChild(newTimeSection);
      },
    },
  });
});
