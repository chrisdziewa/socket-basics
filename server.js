var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));
var clientInfo = {};

io.on('connection', function(socket) {
	console.log('User connected via socket.io!');

	socket.on('joinRoom', function(req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined the room!',
			timestamp: moment.valueOf()
		});
	});

	socket.on('message', function(message) {
		var timestamp = moment().valueOf();	
		message.timestamp = timestamp;
		console.log('Message received @ '  + moment.utc(message.timestamp).local().format('h:mm a') + 
					': ' + message.text); // + message.timestamp.local().format('h:mm a') + ' '
		io.to(clientInfo[socket.id].room).emit('message', message);
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
