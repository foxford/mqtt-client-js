# MQTTClient
MQTT client implementation for JavaScript

## Installation

```sh
npm install --save git+https://github.com/netology-group/mqtt-client-js.git
```

## Example

```js
const client = new MQTTClient('ws://iot.eclipse.org:80/ws')

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
