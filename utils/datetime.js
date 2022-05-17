function addHours(date, hoursDuration) {
    let newDate = new Date(date);
    newDate.setTime(newDate.getTime() + (hoursDuration * 60 * 60 * 1000));
    return newDate;
}

function createDate(date, time) {
    return new Date(date + " " + time);
}

exports.addHours = addHours;
exports.createDate = createDate;