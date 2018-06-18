var fs = require('fs');
var http = require('http').createServer((req, res) => {
  res.writeHead(200, 'OK', {
    'Content-Type': 'text/html; charset=utf-8'
  });
  fs.createReadStream(__dirname + '/chat.html').pipe(res);
});

var io = require('../')(http, {JSON: require('flatted')});
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
