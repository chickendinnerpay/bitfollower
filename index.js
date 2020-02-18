// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 8080;
//other node basics
let websocket = require("websocket");
let urlWebSocketBitMex = 'wss://www.bitmex.com/realtime?subscribe=chat';
let urlWebSocketTrView = 'wss://pushstream.tradingview.com/message-pipe-ws/public/chat';
let wsTrView = new websocket.client();
let wsBitMex = new websocket.client();
let msgArray = [];
/* tradingview feed */
wsTrView.on('connectFailed', function (error) {
  console.log(`TrView client connect error: ` + error.toString());
});
wsTrView.on('connect', function (connection) {
  console.log(`TrView websocket client connected`);

  connection.on('error', function (error) {
    console.log(`TrView connection error: ` + error.toString());
  });
  connection.on('close', function () {
    console.log(`TrView connection closed`);
  });
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      let payload = JSON.parse(message.utf8Data);
      if (payload.text.channel === 'chat_bitcoin') {
        let tViewChatText = payload.text.content.data.text;
        if (!payload.text.content.data.text) { return; }
        if (tViewChatText.slice(0, 7) === "[quote=") {
          var tViewChatNewData = payload.text.content.data.text.replace(`[quote="`, "[ (");
          var tViewChatNewData = tViewChatNewData.replace(`"]`, ") ");
          var tViewChatNewData = tViewChatNewData.replace("[/quote]", " ]");
          let sendToNode = JSON.stringify({
            username: 'BitMex',
            message: `TrView (${payload.text.content.data.username}): ${tViewChatNewData}`
          });
          msgArray.push(sendToNode);
          console.log(sendToNode);
        }
        else {
          let sendToNode = JSON.stringify({
            username: 'BitMex',
            message: `TrView (${payload.text.content.data.username}): ${payload.text.content.data.text}`
          });
          msgArray.push(sendToNode);
          console.log(sendToNode);
        }
      }
    }
  });
});
/* bitmex wss feed*/
wsBitMex.on('connectFailed', function (error) {
  console.log(`BitMex client connect error: ` + error.toString());
});
wsBitMex.on('connect', function (connection) {
  console.log(`BitMex webSocket client connected`);

  connection.on('error', function (error) {
    console.log(`BitMex connection Error: ` + error.toString());
  });
  connection.on('close', function () {
    console.log(`BitMex connection closed`);
  });
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      let payload = JSON.parse(message.utf8Data);
      /*console.log(payload);*/
      if (payload.data) {
        if (!payload.data[0]) {
          /*console.log("no data[0]");*/
          return;
        }
        else if (payload.data[0]) {
          /*console.log("has data[0]");*/
          /*console.log(payload.data[0].channelID);*/ /* fonctionne osti! */
          if (payload.data[0].channelID === 1) { /* 1=us,2=?,3=ru,4=kor,5=?..*/
            let sendToNodeTwo = JSON.stringify({
              username: 'BitMex',
              message: `BitMex (${payload.data[0].user}): ${payload.data[0].message}`
            });
            msgArray.push(sendToNodeTwo);
            console.log(sendToNodeTwo);
            /*console.log("BitMEX (" + payload.data[0].user + ") " + payload.data[0].message);*/
            return;
          }
          else { return; }
        }
        else { console.log("else"); return; }
      }
    }
  });
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;
  function sendMsg() {

    let msg = msgArray.shift();
    if (msg) {
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: msg
      });
      setTimeout(sendMsg, 200);
    }

  }
  sendMsg();

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

//other feed starts...

console.log(`Connecting to TradingView websocket at ${urlWebSocketTrView}`);
wsTrView.connect(urlWebSocketTrView, null);
console.log(`Connecting to BitMEX websocket at ${urlWebSocketBitMex}`);
wsBitMex.connect(urlWebSocketBitMex, null);