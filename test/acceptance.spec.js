
const Factory = require("../index")
const expect = require("chai").expect

describe("helperFactory", () => {
  const config = {
    url: "amqp://localhost",
    exchange: { 
      name: "app_test",
      routingKeys: [
        { 
          name: "pay_clicks", 
          queues: [
            "clicks_debit",
            "clicks_warehouse"
          ] 
        },
        { 
          name: "clicks", 
          queues: [
            "clicks_warehouse"
          ] 
        }
      ]
    }
  }

  let helper
  const message = {
    a: "b"
  }
  
  before(function*(){
    helper = Factory(config)
  })

  describe("#build", () => {

    let ok

    before(function*() {
      ok = yield helper.build()
    })

    it("should responds true", () => {
      expect(ok).to.be.true
    })
  })

  describe("#sendTo", () => {

    let ok

    before(function*() {
      yield helper.build()
      ok = yield helper.sendTo("pay_clicks", JSON.stringify(message))
    })

    it("should responds true", () => {
      expect(ok).to.be.true
    })
  })


  describe("#getFrom", () => {
    
    before(function*(){
      yield helper.build()
      yield helper.sendTo("pay_clicks", JSON.stringify(message))
    })

    context("not remove", () => {
      
      let msg, msg2
      
      before(function*() {
        msg = yield helper.getFrom("clicks_warehouse")
        msg2 = yield helper.getFrom("clicks_warehouse")
      })
      
      it("message should match with the ", () => {
        expect(msg.content.toString()).to.be.eqls(JSON.stringify(message))
      })

      it("first and second messages are the same", () => {
        expect(msg.content.toString()).to.be.eqls(msg2.content.toString())
      })
    })


    context("remove", () => {
      
      let msg, msg2

      before(function*() {
        yield helper.getFrom("clicks_warehouse", { remove: true })
        msg2 = yield helper.getFrom("clicks_warehouse", { remove: true })
      })

      it("#getFrom", function*() {
        expect(msg2.content).to.be.undefined
      })
    })
  })
})