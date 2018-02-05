# API

## new MQTTClient(url, [options])

Connects to the broker specified by the given url and options and
returns an instance of the client.

Options includes (if specified):
* `clientId`: id of the client
* `username`: the username required by your broker, if any
* `password`: the password required by your broker, if any

## Properties

### MQTTClient.events

Enum with constants for event names.

* CONNECT
* RECONNECT
* CLOSE
* OFFLINE
* ERROR
* MESSAGE

## Events

### Event `'connect'`

`function (connack) {}`

Emitted on successful (re)connection.
* `connack` received connack packet.

### Event `'reconnect'`

`function () {}`

Emitted when a reconnect starts.

### Event `'close'`

`function () {}`

Emitted after a disconnection.

### Event `'offline'`

`function () {}`

Emitted when the client goes offline.

### Event `'error'`

`function (error) {}`

Emitted when the client cannot connect or when a parsing error occurs.

### Event `'message'`

`function (topic, message, packet) {}`

Emitted when the client receives a publish packet
* `topic` topic of the received packet
* `message` payload of the received packet
* `packet` received packet

## Methods

### MQTTClient#publish(topic, message, [options], [callback])

Publish a message to a topic

* `topic` is the topic to publish to, `String`
* `message` is the message to publish, `Buffer` or `String`
* `options` is the options to publish with, including:
  * `qos` QoS level, `Number`, default `0`
  * `retain` retain flag, `Boolean`, default `false`
  * `dup` mark as duplicate flag, `Boolean`, default `false`
* `callback` - `function (err)`, fired when the QoS handling completes,
  or at the next tick if QoS 0. An error occurs if client is disconnecting.


### MQTTClient#subscribe(topic, [options], [callback])

Subscribe to a topic

* `topic` is a `String` topic to subscribe to. MQTT `topic` wildcard characters are supported (`+` - for single level and `#` - for multi level)
* `options` is the options to subscribe with, including:
  * `qos` qos subscription level, default 0
* `callback` - `function (err, granted)`
  callback fired on suback where:
  * `err` a subscription error or an error that occurs when client is disconnecting
  * `granted` is an array of `{topic, qos}` where:
    * `topic` is a subscribed to topic
    * `qos` is the granted qos level on it

### MQTTClient#unsubscribe(topic, [callback])

Unsubscribe from a topic

* `topic` is a `String` topic to unsubscribe from
* `callback` - `function (err)`, fired on unsuback. An error occurs if client is disconnecting.

### MQTTClient#disconnect()

Close the client.

### MQTTClient#reconnect()

Connect again using the same options as in constructor

### MQTTClient#on(eventName, eventHandler)

Adds event listener for specified event

### MQTTClient#off(eventName, eventHandler)

Removes event listener for specified event
