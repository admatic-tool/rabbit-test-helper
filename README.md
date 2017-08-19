RabbitTestHelper
===


uso: 
```javascript

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

// generate a helper to build a rabbit objects
let helper = Factory(config)

co(function*() {

  // build a rabbit env structure how described in config
  yield helper.build()

  const message = {
    a: "b"
  }
  // send a message to routeKey
  ok = yield helper.sendTo("pay_clicks", JSON.stringify(message))

  // get a message from querue, but not remove it
  let msg = yield helper.getFrom("clicks_warehouse")

  // get a message from queue, and remove it
  msg = helper.getFrom("clicks_warehouse", { remove: true })
})
```