var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

var io = require('../')(http);
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
  console.log('listening on *:3000');
});
