var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));
var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers(socket) {
	var info = clientInfo[socket.id];
	var users = [];
	if (typeof info === 'undefined') {
		return;
	}
	Object.keys(clientInfo).forEach(function(socketId) {
		if (clientInfo[socketId].room === info.room) {
			users.push(clientInfo[socketId].name);
		}
	});
	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

// My original code - not part of tutorial
function sendPrivateMessage(socket, message) {
	var sender = clientInfo[socket.id];
	var timestamp = moment().valueOf();
	var receiver;
	var messageSent = false;
	Object.keys(clientInfo).forEach(function(socketId) {
		receiver = clientInfo[socketId].name;
		if (message.text.toLowerCase().indexOf(receiver.toLowerCase()) === 1) {
			var shortMessage = message.text.slice(receiver.length + 1);
			io.to(socketId).emit('message', {
				name: '<strong>Private Message from: </strong>' + sender.name,
				text: shortMessage,
				timestamp: timestamp
			});
			socket.emit('message', {
				name: 'PM - ' + sender.name + ' to ' + receiver + ':',
				text: shortMessage,
				timestamp: timestamp
			});
			console.log('PM from ' + sender + ' to ' + receiver + ':');
			console.log(shortMessage);
			messageSent = true;
		}
	});
	// No user found
	if (!messageSent) {
		socket.emit('message', {
			name: 'System',
			text: 'No user\' ' + receiver.slice(1) + '\' was found in the chat',
			timestamp: timestamp
		});
	}
}

io.on('connection', function(socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function() {
		var userData = clientInfo[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left the room',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

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
		console.log('Message received @ ' + moment.utc(message.timestamp).local().format('h:mm a') +
			': ' + message.text); // + message.timestamp.local().format('h:mm a') + ' '

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else if ((/^\@[a-zA-Z ]+/).test(message.text)) {
			sendPrivateMessage(socket, message);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
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
