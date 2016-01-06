var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room') || 'General Chat';
var socket = io();
socket.on('message', function(message) {
	var localTime = moment.utc(message.timeStamp).local().format('h:mm a');
	var $message = $('.messages');
	$message.append('<li class="list-group-item"><p class="user"><strong>' + message.name +
		' ' + localTime + '</strong>:</p><p class="message">' + message.text + '</p>');
});

socket.on('connect', function() {
	console.log('Connected to socket.io server!');
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});
// Display room name header
$('.room-title').text(room);

// handles submitting of new message
var $form = $('#message-form');
$form.on('submit', function(event) {
	event.preventDefault();
	var $message = $form.find('input[name=message]');
	if ($message.val().trim() === '') {
		return false;
	}
	var timeStamp = moment().valueOf();

	socket.emit('message', {
		name: name,
		text: $message.val(),
		timeStamp: timeStamp
	});
	$message.val('');
});
