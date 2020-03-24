import mqtt from 'mqtt'
import MQTTPattern from 'mqtt-pattern'

class MQTTClient {
  static get events () {
    return {
      CONNECT: 'connect',
      RECONNECT: 'reconnect',
      CLOSE: 'close',
      OFFLINE: 'offline',
      ERROR: 'error',
      END: 'end',
      MESSAGE: 'message',
      PACKETSEND: 'packetsend',
      PACKETRECEIVE: 'packetreceive'
    }
  }

  constructor (url) {
    this._client = null
    this._patterns = {}
    this._url = url

    this._handleMessageEvent = this._handleMessageEvent.bind(this)
  }

  get connected () {
    return this._client.connected
  }

  get reconnecting () {
    return this._client.reconnecting
  }

  _handleMessageEvent (topic, message, packet) {
    const patterns = Object.keys(this._patterns)

    patterns.forEach((pattern) => {
      const topicParams = MQTTPattern.exec(pattern, topic)

      if (topicParams !== null) {
        this._patterns[pattern](topicParams, topic, message, packet)
      }
    })
  }

  attachRoute (topicPattern, handler) {
    this._patterns[topicPattern] = handler
  }

  detachRoute (topicPattern) {
    if (this._patterns[topicPattern]) {
      delete this._patterns[topicPattern]
    }
  }

  connect (options) {
    this._client = mqtt.connect(this._url, options)

    this._client.on(MQTTClient.events.MESSAGE, this._handleMessageEvent)
  }

  disconnect (...args) {
    this._client.end(...args)
  }

  reconnect () {
    this._client.reconnect()
  }

  subscribe (topic, options, callback) {
    this._client.subscribe(topic, options, callback)
  }

  unsubscribe (topic, callback) {
    this._client.unsubscribe(topic, callback)
  }

  publish (topic, message, options, callback) {
    this._client.publish(topic, message, options, callback)
  }

  on (eventName, eventHandler) {
    this._client.on(eventName, eventHandler)
  }

  off (eventName, eventHandler) {
    this._client.removeListener(eventName, eventHandler)
  }
}

export default MQTTClient
