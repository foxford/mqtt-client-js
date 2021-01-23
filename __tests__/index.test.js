import MQTTClient from '../src'
import WS from 'jest-websocket-mock'

const BROKER = 'ws://localhost:1234'

afterAll(() => {
  WS.clean()
})

describe('Class', () => {
  it('should be defined', () => {
    expect(MQTTClient).toBeInstanceOf(Function)
  })
  it('should have static property events', () => {
    expect(MQTTClient.events).toBeInstanceOf(Object)
  })
  it('should create client', () => {
    const client = new MQTTClient(BROKER)

    expect(client).toBeInstanceOf(MQTTClient)
  })
})

describe('Instance methods', function () {
  it('should connect to broker', async function (done) {
    const client = new MQTTClient(BROKER)
    const server = new WS(BROKER)
    await server.connected
    client.connect()

    client.on(MQTTClient.events.CONNECT, function () {
      client.disconnect()
      done()
    })
  })
})
