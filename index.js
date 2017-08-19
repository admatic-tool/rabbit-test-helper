

const co = require("co")
const amqplib = require("amqplib")



module.exports = config => {

  return {
    
    config,

    _getConnection: co.wrap(function*(){
      if (this.conn){
        return this.conn
      } else
        this.conn = yield amqplib.connect(this.config.url)

      return this.conn
    }),

    sendTo: co.wrap(function*(routingKey, content) {
      const conn = yield this._getConnection()
      const ch = yield conn.createChannel()
      const { exchange } = config
      debugger
      const ok = ch.publish(exchange.name, routingKey, new Buffer(content))
      debugger
      ch.close()
      return ok
    }),

    getFrom: co.wrap(function*(queue, { remove = false } = {}) {
      const conn = yield this._getConnection()
      const ch = yield conn.createChannel()
      const msg = yield ch.get(queue, { noAck: remove })
      
      ch.close()

      return msg
    }),


    build: co.wrap(function*() {
      const conn = yield this._getConnection()
      const ch = yield conn.createChannel()
      const { exchange } = config

      yield ch.deleteExchange(exchange.name)
      yield ch.assertExchange(exchange.name, "direct")
            
      for(const key of exchange.routingKeys) {
        for(const queue of key.queues) {
          yield ch.deleteQueue(queue)
        }
      }
      
      for(const key of exchange.routingKeys) {
        for(const queue of key.queues) {
          yield ch.assertQueue(queue)
          yield ch.bindQueue(queue, exchange.name, key.name)
        }
      }
      ch.close()

      return true
    })
  }
}