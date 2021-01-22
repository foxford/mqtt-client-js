import MQTTClient from '../src'

const BROKER = 'wss://test.mosquitto.org:8081/'

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
