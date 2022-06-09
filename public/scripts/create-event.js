document.addEventListener("DOMContentLoaded", function () {
  var app = new Vue({
    el: "#wrapper",
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
        proposed_times: {},
      };
    },
    methods: {
      closeAlert() {
        let alertBars = document.getElementsByClassName("alert-bar");
        for (let alertBar of alertBars) {
          alertBar.style.display = "none";
        }
      },
      onSubmit(e) {
        e.preventDefault();
        if (Object.values(this.proposed_times).length == 0) {
          document.getElementById("alert-error-text").innerText =
            "Please add at least one proposed start time";
          document.getElementById("alert-error").style.display = "block";
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }
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
        formData.append("proposed_times", Object.values(this.proposed_times));

        let file = e.target[10].files[0];
        formData.append("file", file);

        sendFileAJAX("POST", "/create-event", formData, function (err, res) {
          if (err) {
            console.log(err);
            document.getElementById("alert-error-text").innerText = "Error in creating event";
            document.getElementById("alert-error").style.display = "block";
            return;
          }

          document.getElementById("alert-success").style.display = "block";
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          setTimeout(function () {
            window.location.href = "/";
          }, 1000);
        });
      },
      addTimeSelect(e) {
        e.preventDefault();

        var id = Date.now();
        var timeList = document.getElementById("times");

        var newTimeSection = document.createElement("div");
        newTimeSection.setAttribute("class", "time-box");

        var newTime = document.createElement("input");
        newTime.type = "time";
        newTime.required = true;
        newTime.setAttribute("data-id", id);
        newTime.addEventListener("change", (event) => {
          event.preventDefault();
          let id = event.target.dataset.id;
          this.proposed_times[id] = event.target.value;
        });

        var text = document.createElement("p");
        text.innerText = "Proposed Event Time: ";

        var icon = document.createElement("ion-icon");
        icon.setAttribute("name", "close-outline");
        icon.setAttribute("data-id", id);
        icon.addEventListener("click", (event) => {
          event.preventDefault();
          let id = event.target.dataset.id;

          delete this.proposed_times[id];

          newTimeSection.remove();
        });

        newTimeSection.appendChild(text);
        newTimeSection.appendChild(newTime);
        newTimeSection.appendChild(icon);

        timeList.appendChild(newTimeSection);
      },
    },
  });

  document.getElementById("add-start-time-button").click();
});
