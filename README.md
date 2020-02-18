
# Socket.IO BitFollower Chat

A Cryptocurrency chat using BitMex Trollchat and TradingView chat websocket feeds.

## How to use

```
$ cd socket.io
$ npm install
$ cd examples/chat
$ npm install
$ npm start
```

And point your browser to `http://localhost:8080`. Optionally, specify
a port by supplying the `PORT` env variable.

listening to wss://www.bitmex.com/realtime?subscribe=chat and wss://pushstream.tradingview.com/message-pipe-ws/public/chat

## Features

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.
- A notification is sent to all users when someone is typing.

## ToDo
- refuse BitMex and TrView username
- fix current input from wsTrView and wsBitMex to msgArray
- Add frame to display tradingview advanced chart api with tools {
/*<!-- TradingView Widget BEGIN -->
<div class="tradingview-widget-container">
  <div id="tradingview_f6a72"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
  <script type="text/javascript">
  new TradingView.widget(
  {
  "autosize": true,
  "symbol": "BITMEX:XBTUSD",
  "interval": "D",
  "timezone": "Etc/UTC",
  "theme": "Dark",
  "style": "1",
  "locale": "en",
  "toolbar_bg": "#f1f3f6",
  "enable_publishing": true,
  "withdateranges": true,
  "hide_side_toolbar": false,
  "allow_symbol_change": true,
  "container_id": "tradingview_f6a72"
}
  );
  </script>
</div>
<!-- TradingView Widget END -->
*/
}

#bitfollower
