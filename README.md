pocket.io
=========

A minimalistic version of [socket.io](https://socket.io) that weights about 1K instead of 60K.

```html
<!-- you require it on the client same way -->
<script src="/pocket.io/pocket.io.js"></script>
<!-- and it exposes most basic, and same, API -->
<script>
  $(function () {
    var socket = io();
    socket.on('connect', function () {
      console.log(socket.id);
    });
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
    });
    $('form').submit(function(){
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
  });
</script>
```

On the Node.js side, you do the same you are doing now.

Try `node test/chat-express.js` and visit `localhost:3000` to see the classic chat demo working.

```js
var app = require('express')();
var http = require('http').Server(app);
var io = require('pocket.io')(http);

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
  console.log('listening on *:3000');
});
```

### API differences

You can specify a JSON like parser through the option.

As example, this is how you'd use recursion compatible serialization via the [flatted](https://github.com/WebReflection/flatted#flatted) module.

```js
// Node.js
io(server, {JSON: require('flatted/cjs')});

// client, after having Flatted exposed somehow, i.e.
// <script src="//unpkg.com/flatted"></script>
io({JSON: Flatted});
```
