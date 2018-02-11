const colors = require('colors');

let start = true;

const log = (message, oneLiner = false) => {

    if (!start  || oneLiner) {
        console.log((message + '').green);
    } else {
        process.stdout.write(message + ' ');
    }

    start = !start;

    if (oneLiner) {
        start = true;
    }
}

const error = (message) => {

    if (!start) {
        console.log('Failed'.red);
    }

    console.log((message + '').red);
    start = true;
}

module.exports = {
    log: log,
    error: error,
}