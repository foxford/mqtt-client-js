import mqtt from 'mqtt'

class MQTTClient {
  static get events () {
    return {
      CONNECT: 'connect',
      RECONNECT: 'reconnect',
      CLOSE: 'close',
      OFFLINE: 'offline',
      ERROR: 'error',
      MESSAGE: 'message'
    }
  }
  constructor (url, options) {
    const config = {}

    if (options) {
      if (options.username) {
        config.username = options.username
      }

      if (options.password) {
        config.password = options.password
      }

      if (options.clientId) {
        config.clientId = options.clientId
      }
    }

    this._client = mqtt.connect(url, config)
  }
  disconnect () {
    this._client.end()
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
    this._client.off(eventName, eventHandler)
  }
}

export default MQTTClient
