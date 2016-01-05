var socket = io();
socket.on('connect', function() {
	console.log('Connected to socket.io server!');
});

socket.on('message', function(message) {
	var localTime = moment.utc(message.timeStamp).local().format('h:mm a');
	jQuery('.messages').append('<p><strong>' + localTime + '</strong>: ' + message.text + '</p>');
});
// handles submitting of new message
var $form = jQuery('#message-form');
$form.on('submit', function(event) {
	event.preventDefault();
	var $message = $form.find('input[name=message]');
	if ($message.val().trim() === '') {
		return false;
	}
	var timeStamp = moment().valueOf();

	socket.emit('message', {
		text: $message.val(),
		timeStamp: timeStamp
	});
	$message.val('');
});
