/*! (c) Andrea Giammarchi (ISC) */

var http = require('http');
var path = require('path');
var uuid = require('uuid');

var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');

var client = {
  url: '/pocket.io/pocket.io.js',
  js: require('fs').readFileSync(
    path.join(__dirname, 'min.js')
  )
};

module.exports = function (app, options) {
  if (
    arguments.length === 1 &&
    Object.getPrototypeOf(app) === Object.prototype
  ) {
    options = app;
    app = options.server;
  }
  var server;
  var SR = options && options.JSON || JSON;
  if (app instanceof http.Server) {
    var request = app._events.request;
    server = app;
    app._events.request = function (req) {
      return req.url === client.url ?
        responder.apply(this, arguments) :
        request.apply(this, arguments);
    };
  } else {
    server = http.Server(app);
    app.get(client.url, responder);
    Object.defineProperty(app, 'listen', {
      configurable: true,
      value: function () {
        server.listen.apply(server, arguments);
        return app;
      }
    });
  }
  var emitters = new WeakMap;
  var ws = new WebSocket.Server({server: server});
  var io = new EventEmitter;
  var ioemit = io.emit.bind(io);
  io.emit = function (type, data) {
    ws.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(asJSON(type, data));
      }
    });
  };
  ws.on('connection', function (socket) {
    var emitter = new EventEmitter;
    var emit = emitter.emit.bind(emitter);
    socket.on('ping', function (data) {
      emit('ping', data);
    });
    socket.on('pong', function (data) {
      emit('pong', data);
    });
    socket.on('error', function (error) {
      emit('error', error);
    });
    socket.on('close', function () {
      emit('disconnect');
    });
    socket.on('message', function (data) {
      const info = SR.parse(data);
      if (info.type === 'connect') {
        socket.send(asJSON(
          info.type,
          emitter.id = uuid.v4()
        ));
      }
      emit(info.type, info.data);
    });
    emitter.emit = function (type, data) {
      if (socket.readyState === WebSocket.OPEN)
        socket.send(asJSON(type, data));
    };
    emitter.broadcast = {
      emit: function (type, data) {
        ws.clients.forEach(function each(client) {
          if (
            client !== socket &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(data);
          }
        });
      }
    };
    emitters.set(socket, emitter);
    ioemit('connection', emitter);
  });
  ws.on('error', function (error) {
    ioemit('error', error);
  });
  return io;
  function asJSON(type, data) {
    return SR.stringify({
      type: type,
      data: data
    });
  }
};

function responder(req, res, next) {
  res.writeHead(200, 'OK', {
    'Content-Type': 'application/javascript'
  });
  res.end(client.js);
  if (next) next();
}
