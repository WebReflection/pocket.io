function io(url) { "use strict";
  /*! (c) Andrea Giammarchi (ISC) */
  var listeners = {};
  var parts = new URL(url || location.href);
  var socket = new WebSocket([
    parts.protocol.replace('http', 'ws'),
    '//',
    parts.host,
    '/pocket.io/'
  ].join(''));
  socket.onopen = function (event) {
    pocket.emit('connect');
  };
  socket.onmessage = function (event) {
    var info = JSON.parse(event.data);
    var cbs = listeners[info.type];
    if (info.type === 'connect') {
      pocket.id = info.data;
      emit(cbs);
    }
    else if (info.data)
      emit(cbs, info.data);
    else
      emit(cbs);
  };
  socket.onerror = function (error) {
    emit(listeners.error, error);
  };
  socket.onclose = function (event) {
    socket = null;
    emit(listeners.close);
  };
  var pocket = {
    close: function () {
      if (socket) socket.close();
      return pocket;
    },
    emit: function (type, data) {
      socket.send(JSON.stringify({
        type: type,
        data: data
      }));
      return pocket;
    },
    listeners: function (type) {
      return listeners[type] || [];
    },
    hasListeners: function (type) {
      return 0 < pocket.listeners(type).length;
    },
    on: function (type, callback) {
      (listeners[type] || (listeners[type] = [])).push(callback);
      return pocket;
    },
    once: function (type, callback) {
      var current = listeners[type] || (listeners[type] = []);
      current.push(
        function once() {
          current.splice(current.indexOf(once), 1);
          callback.apply(this, arguments);
        }
      );
      return pocket;
    },
    off: function (type, callback) {
      var current = listeners[type] || [];
      var i = current.indexOf(callback);
      if (-1 < i) current.splice(i, 1);
      return pocket;
    },
    send: function (data) {
      return pocket.emit('message', data);
    }
  };
  return pocket;
  function emit(listeners) {
    (listeners || []).forEach(
      function (fn) { fn.apply(pocket, this); },
      [].slice.call(arguments, 1)
    );
  }
}
