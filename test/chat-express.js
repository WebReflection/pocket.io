var app = require('express')();
var http = require('http').Server(app);
var io = require('../')({
  server: http,
  JSON: require('flatted')
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on http://localhost:3000/');
});
