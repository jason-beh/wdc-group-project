function sendAJAX(method, url, formData, cb) {
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        cb(null, xmlHttp.responseText);
      } else {
        cb(new Error(xmlHttp.responseText), xmlHttp.response);
      }
    }
  };

  xmlHttp.open(method, url, true);
  if (method !== "GET") {
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(formData);
  } else {
    xmlHttp.send();
  }
}

function sendFileAJAX(method, url, formData, cb) {
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        cb(null, xmlHttp.responseText);
      } else {
        cb(new Error(xmlHttp.responseText), xmlHttp.response);
      }
    }
  };

  xmlHttp.open(method, url, true);
  if (method !== "GET") {
    xmlHttp.send(formData);
  } else {
    xmlHttp.send();
  }
}
