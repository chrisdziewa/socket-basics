var moment = require('moment');
var now = moment();

//X is for Unix seconds
console.log(now.format('X'));
console.log(now.format('x'));
console.log(now.valueOf());

var timestamp = 1452019811108;
var timestampMoment = moment.utc(timestamp);
console.log(timestampMoment.format());
console.log(timestampMoment.local().format('h:mm a'));
// console.log(now.format('MMM Do YYYY, h:mma')); // Oct 5th 2015, 6:45 pm

