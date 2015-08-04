var io = require('socket.io').listen(parseInt(process.env.PORT));
var redis = require('redis')
// var commentClient = redis.createClient();
// var roomClient    = redis.createClient();



var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);

var commentClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
commentClient.auth(redisURL.auth.split(":")[1]);

var roomClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
roomClient.auth(redisURL.auth.split(":")[1]);


commentClient.subscribe('comment-created')
roomClient.subscribe('room-created')

io.sockets.setMaxListeners(20)


// io.configure(function () { 
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });

io.on('connection', function(socket) {
	console.log('connection made')
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

