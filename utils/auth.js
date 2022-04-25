var objects = require('./objects');

function userIsLoggedIn(user) {
    return (user && !objects.isEmpty(user));
}

function userIsAdmin(user) {
    if (!userIsLoggedIn(user)) return false;
    return user.isAdmin;
}

exports.userIsLoggedIn = userIsLoggedIn;
exports.userIsAdmin = userIsAdmin;