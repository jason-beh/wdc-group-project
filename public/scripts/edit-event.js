// TODO: move to separate script file
document.addEventListener("DOMContentLoaded", function () {
  // Load profile
  sendAJAX("GET", "/get-event", null, function (err, res) {
    // if (err) {
    //   // do something
    //   console.log(err);
    // }

    var res = {
      title: "aaa",
      description: "aaa",
      proposal_date: "aaa",
      address_line: "aaa",
      postcode: "aaa",
      state: "aaa",
      country: "aaa",
      duration: 2,
      proposed_times: ["test", "test2"],
    };
    var app = new Vue({
      el: "#edit-form",
      data() {
        return {
          title: res.title,
          description: res.description,
          proposal_date: res.proposal_date,
          address_line: res.address_line,
          postcode: res.postcode,
          state: res.state,
          country: res.country,
          duration: res.duration,
          proposed_times: ["test", "test2"],
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
            "/edit-event",
            JSON.stringify(formData),
            function (err, res) {
              // TODO: Notify user whether it fails or succeeds
            }
          );
        },
      },
    });
  });
});
