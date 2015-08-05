var io = require('socket.io').listen(parseInt(process.env.PORT) || 5001);
var url = require('url');
var redis = require('redis');
var redisURL = url.parse(process.env.REDISCLOUD_URL);

var commentClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
var roomClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
commentClient.auth(redisURL.auth.split(":")[1]);
roomClient.auth(redisURL.auth.split(":")[1]);

// localhost bullshit
// var commentClient = redis.createClient();
// var roomClient = redis.createClient();

commentClient.subscribe('comment-created')
roomClient.subscribe('room-created')

// Max listeners?
io.sockets.setMaxListeners(20)

// roomlisteners
// var roomcounter = {}

// Connection in general
io.on('connection', function(socket) {
	var url = io.sockets.sockets[0].handshake.headers.referer


	// TODO: Namespace rooms, find connected users
	var roomcode = url.match(/http:\/\/localhost:3000\/chatrooms\/(.*)/)[1]
	var num_of_people_in_room = socket.join(roomcode).conn.server.clientsCount
	console.log('connection made to ' + url + ' : ' + num_of_people_in_room)
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

