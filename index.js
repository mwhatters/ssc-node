var io = require('socket.io').listen(parseInt(process.env.PORT) || 5001);
var url = require('url');
var redis = require('redis');

// localhost bullshit
var commentClient = redis.createClient();
var roomClient = redis.createClient();

// var redisURL = url.parse(process.env.REDISCLOUD_URL);
// var commentClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
// var roomClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
// commentClient.auth(redisURL.auth.split(":")[1]);
// roomClient.auth(redisURL.auth.split(":")[1]);

commentClient.subscribe('comment-created')
roomClient.subscribe('room-created')

// Max listeners
io.sockets.setMaxListeners(20)

// Connection in general
io.on('connection', function(socket) {
	var url = io.sockets.sockets[0].handshake.headers.referer

	//Joining a room
	socket.on('room-joined', function(room) {
		socket.join(room)
		// console.log('a room has been joined! roomkey: ' + room)

		var currentRoom = io.sockets.adapter.rooms[room]
		var currentRoomCount = Object.keys(currentRoom).length
		io.sockets.emit('usercount-'+room, currentRoomCount)
	})

	//Leaving a room
	socket.on('room-left', function(room) {
		socket.leave(room)
		// console.log('a room has been left! roomkey: ' + room)

		var currentRoom = io.sockets.adapter.rooms[room]
		var currentRoomCount = Object.keys(currentRoom).length
		io.sockets.emit('usercount-'+room, currentRoomCount)
	})

});	

	commentClient.on('message', function(channel, commentList){
		console.log('comments recieved')
		var data = JSON.parse(commentList)
		var comments = data.slice(1)
		var room = data[0].url
		io.sockets.emit(room, comments)
		}
	);


	roomClient.on('message', function(channel, roomList) {
		console.log('room-created message recieved')
		var data = JSON.parse(roomList)
		io.sockets.emit('room-created', data);
		}
	);




// SOME OLD BULLSHIT CODE

// TODO: Namespace rooms, find connected users
// var roomcode = url.match(/http:\/\/localhost:3000\/chatrooms\/(.*)/)
// var roomkey = null

	// var url = io.sockets.sockets[0].handshake.headers.referer

	// if (roomcounter.hasOwnProperty(url)) {
	// 	roomcounter[url]++
	// } else {
	// 	roomcounter[url] = 1
	// }
	// console.log(roomcounter)

	// socket.on('disconnect', function(){
	// 	roomcounter[url]--
	// 	console.log('disconnection')
	// 	console.log(roomcounter)
	// })

	//ensure that a room is joined, and it not the homepage
	// if (roomcode != null) {
	// 	roomkey = roomcode[1]
	// 	socket.join(roomkey)
	// 	console.log('room joined! key: ' + roomkey + ' --- number of users: ' + Object.keys(roomkey).length)
	// }

