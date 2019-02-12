import mqtt from 'mqtt'

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
    this._url = url
  }
  get connected () {
    return this._client.connected
  }
  get reconnecting () {
    return this._client.reconnecting
  }
  connect (options) {
    this._client = mqtt.connect(this._url, options)
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
    this._client.removeListener(eventName, eventHandler)
  }
}

export default MQTTClient
