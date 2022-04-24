const path = require('path');

function pathToHtml(filename) {
    return path.join(__dirname, '../views', filename);
}

exports.pathToHtml = pathToHtml;