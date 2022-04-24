var objects = require('./objects');

function userIsLoggedIn(user) {
    return (user && !objects.isEmpty(user));
}

exports.userIsLoggedIn = userIsLoggedIn;