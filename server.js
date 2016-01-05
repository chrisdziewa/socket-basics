var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));
io.on('connection', function(socket) {
	console.log('User connected via socket.io!');
	socket.on('message', function(message) {
		var timestamp = moment().valueOf();	
		message.timestamp = timestamp;
		console.log('Message received @ '  + moment.utc(message.timestamp).local().format('h:mm a') + ': ' + message.text); // + message.timestamp.local().format('h:mm a') + ' '
		io.emit('message', message);
	});

	// timestamp property - Javascript timestamp (milliseconds)
		socket.emit('message', {
			name: 'System',
			text: 'Welcome to the chat application',
			timestamp: moment().valueOf()
		});
});

http.listen(PORT, function() {
	console.log('Server listening on port ' + PORT);
});
