import { assert } from 'chai'
import MQTTClient from '../index'

const BROKER = 'ws://iot.eclipse.org:80/ws'

describe('Class', function () {
  it('should be defined', function () {
    assert.equal(typeof MQTTClient, 'function')
  })
  it('should have static property events', function () {
    assert.equal(typeof MQTTClient.events, 'object')
  })
  it('should create client', function () {
    const client = new MQTTClient(BROKER)

    assert.equal(client instanceof MQTTClient, true)

    client.disconnect()
  })
})

describe('Instance methods', function () {
  it('should connect to broker', function (done) {
    const client = new MQTTClient(BROKER)

    client.on(MQTTClient.events.CONNECT, function (event) {
      client.disconnect()
      done()
    })
  })
  it('should subscribe to topic', function (done) {
    const client = new MQTTClient(BROKER)

    client.subscribe('test/topic', null, function (err, event) {
      client.disconnect()

      if (err) {
        done(err)

        return
      }

      done()
    })
  })
  it('should publish to topic and receive message', function (done) {
    const client = new MQTTClient(BROKER)
    const TOPIC = 'test/topic/1'
    const MESSAGE = 'hello world'

    client.on(MQTTClient.events.CONNECT, function (event) {
      client.on(MQTTClient.events.MESSAGE, function (topic, message) {
        client.disconnect()
        assert.equal(topic, TOPIC)
        assert.equal(message.toString(), MESSAGE)
        done()
      })

      client.subscribe(TOPIC, null, function (err, event) {
        if (err) {
          done(err)

          return
        }

        client.publish(TOPIC, MESSAGE, null, function (err, event) {
          if (err) {
            done(err)
          }
        })
      })
    })
  })
})
