import MQTTClient from '../src'
// import WS from 'jest-websocket-mock'
// jest.mock('ws')

const BROKER = 'ws://test.mosquitto.org:8080/'
// const BROKER = 'ws://localhost:1234'

describe('Class', () => {
  test('should be defined', () => {
    expect(typeof MQTTClient)
      .toEqual('function')
  })

  test('should have static property events', () => {
    expect(typeof MQTTClient.events)
      .toEqual('object')
  })

  test('should create client', () => {
    const client = new MQTTClient(BROKER)

    expect(client instanceof MQTTClient)
      .toBeTruthy()
  })
})

describe('Instance methods', () => {
  let client
  // let server

  beforeEach(() => {
    // server = new WS(BROKER)
    // await server.connected
    client = new MQTTClient(BROKER)
    client.connect()
  })
  afterEach(() => {
    // WS.clean()
  })

  test('should connect to broker', (done) => {
    client.on(MQTTClient.events.CONNECT, () => {
      try {
        client.disconnect()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  test('should subscribe to topic', (done) => {
    client.subscribe('test/topic', null, (err, _) => {
      client.disconnect()
      if (err) {
        done(err)
        return
      }
      done()
    })
  })

  test('should publish to topic and receive message', (done) => {
    const TOPIC = 'test/topic/123'
    const MESSAGE = 'hello world'

    client.on(MQTTClient.events.CONNECT, () => {
      client.on(MQTTClient.events.MESSAGE, (topic, message) => {
        client.disconnect()

        expect(topic).toEqual(TOPIC)
        expect(message.toString()).toEqual(MESSAGE)

        done()
      })

      client.subscribe(TOPIC, null, (err, _) => {
        if (err) {
          done(err)
          return
        }

        client.publish(TOPIC, MESSAGE, null, (err, _) => {
          if (err) {
            done(err)
          }
        })
      })
    })
  })

  test('should add listener and remove it', (done) => {
    client.on(MQTTClient.events.CONNECT, () => {
      try {
        client.disconnect()
        done()
      } catch (error) {
        done(error)
      }
    })

    const emptyMessageEventHandler = (topic, message) => { }

    client.on(MQTTClient.events.MESSAGE, emptyMessageEventHandler)
    client.off(MQTTClient.events.MESSAGE, emptyMessageEventHandler)
  })
})
