[![codecov](https://codecov.io/gh/netology-group/mqtt-client-js/branch/master/graph/badge.svg?token=e8wYp0pAiX)](https://codecov.io/gh/netology-group/mqtt-client-js)

# MQTT client
MQTT client implementation for JavaScript

## Installation

```sh
npm install --save @netology-group/mqtt-client
```

## Example

```js
const client = new MQTTClient('ws://iot.eclipse.org:80/ws')

client.connect()

client.on(MQTTClient.events.MESSAGE, function (topic, message) {
  console.log('[message]', topic, message.toString())
  client.disconnect()
})

client.on(MQTTClient.events.CONNECT, function (event) {
  client.subscribe('test/topic/1/#', null, function (err, data) {
    client.publish('test/topic/1/2/3', 'Hello, MQTT!')
  })
})
```

## Documentation

* [API](docs/API.md)
