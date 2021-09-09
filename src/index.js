import mqtt from 'mqtt'
import MQTTPattern from 'mqtt-pattern'

import { mqttReasonCodeNameEnum } from './constants'

const defaultOptions = {
  keepalive: 10,
  properties: {
    userProperties: {
      connection_mode: 'default',
      connection_version: 'v2'
    }
  },
  protocolVersion: 5,
  reconnectPeriod: 0,
  username: ''
}

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

  get disconnected () {
    return this._client.disconnected
  }

  get disconnecting () {
    return this._client.disconnecting
  }

  get reconnecting () {
    return this._client.reconnecting
  }

  _bindEventListeners () {
    this._client.on(MQTTClient.events.MESSAGE, this._handleMessageEvent)
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

    this._bindEventListeners()
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

class ReconnectingMQTTClient extends MQTTClient {
  constructor (url, tokenProvider, reconnectLimit) {
    super(url)

    this._forcedClose = false
    this._reconnectCount = 0
    this._reconnectLimit = reconnectLimit || 3
    this._tokenProvider = tokenProvider
    this._tokenProviderPromise = null

    this._handleCloseEvent = this._handleCloseEvent.bind(this)
    this._handleConnectEvent = this._handleConnectEvent.bind(this)
    this._handlePacketReceiveEvent = this._handlePacketReceiveEvent.bind(this)
    this._handleReconnectEvent = this._handleReconnectEvent.bind(this)
  }

  _bindEventListeners () {
    super._bindEventListeners()

    this._client.on(ReconnectingMQTTClient.events.CLOSE, this._handleCloseEvent)
    this._client.on(ReconnectingMQTTClient.events.CONNECT, this._handleConnectEvent)
    this._client.on(ReconnectingMQTTClient.events.PACKETRECEIVE, this._handlePacketReceiveEvent)
    this._client.on(ReconnectingMQTTClient.events.RECONNECT, this._handleReconnectEvent)
  }

  _handleCloseEvent (error) {
    if (error) {
      console.error('[mqttClient] close with error', error, error.toString())
    }

    console.log('[mqttClient] close, forced:', this._forcedClose)

    if (this._reconnectCount >= this._reconnectLimit) {
      this.disconnect()

      // onCloseHandler && onCloseHandler(RECONNECT_LIMIT_EXCEEDED)
      // this._client.emit('reconnect_limit_exceeded')
    } else if (!this._forcedClose) {
      this.reconnect()
    }
  }

  _handleConnectEvent () {
    console.log('[mqttClient] connected')

    this._forcedClose = false
    this._reconnectCount = 0
  }

  _handlePacketReceiveEvent (packet) {
    if (packet && packet.reasonCode > 0 && mqttReasonCodeNameEnum[packet.reasonCode]) {
      const { cmd, reasonCode } = packet

      // eslint-disable-next-line no-console
      console.debug(`[mqtt] Command '${cmd}', reasonCode ${reasonCode} (${mqttReasonCodeNameEnum[reasonCode]})`)

      // ignore 131 (MQTT broker limits)
      if (reasonCode === 131) {
        return
      }

      this.disconnect()

      // reconnect only on KEEP_ALIVE_TIMEOUT
      if (reasonCode === 141) {
        this.reconnect()
      } else {
        // onCloseHandler && onCloseHandler(mqttReasonCodeNameEnum[packet.reasonCode])
        // this._client.emit('disconnect', { reason: mqttReasonCodeNameEnum[packet.reasonCode] })
      }
    }
  }

  _handleReconnectEvent () {
    this._reconnectCount += 1
  }

  connect (options) {
    return this._tokenProvider
      .getToken()
      .then((password) => {
        super.connect({ ...options, password })

        return new Promise((resolve, reject) => {
          const connectHandler = () => {
            offHandlers()
            resolve()
          }
          const errorHandler = (error) => {
            offHandlers()
            reject(error)
          }
          const offHandlers = () => {
            this._client.off(ReconnectingMQTTClient.events.CONNECT, connectHandler)
            this._client.off(ReconnectingMQTTClient.events.ERROR, errorHandler)
          }

          this._client.on(ReconnectingMQTTClient.events.CONNECT, connectHandler)
          this._client.on(ReconnectingMQTTClient.events.ERROR, errorHandler)
        })
      })
  }

  disconnect () {
    this._forcedClose = true

    super.disconnect(true)
  }

  reconnect () {
    if (this._tokenProviderPromise !== null) return

    this._tokenProviderPromise = this._tokenProvider
      .getToken()
      .then((password) => {
        this._tokenProviderPromise = null

        this._client.options.password = password

        super.reconnect()

        return null
      })
      .catch(() => {
        this._tokenProviderPromise = null

        this.disconnect()
      })
  }
}

export {
  MQTTClient,
  ReconnectingMQTTClient,
  defaultOptions
}
