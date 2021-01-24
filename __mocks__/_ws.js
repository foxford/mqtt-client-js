const MockWebSocket = require('mock-socket').WebSocket
const MockServer = require('mock-socket').Server

class ws extends MockWebSocket {
  constructor (url) {
    console.log('WS |>', url)
    super(url)
  }
}
class server extends MockServer {
  constructor (url) {
    console.log('Server |>', url)
    super(url)
  }
}
ws.Server = server

module.exports = ws
