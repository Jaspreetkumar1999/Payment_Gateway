const express = require("express");
const ejs = require("ejs");
var paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AdltWRgJkSFy42sh68LCb2T5JVV-w8Tjs840V6LvDoeJffulW1F3moYqrSGG9efsv7kbwqXlOHMobtvh",
  client_secret:
    "EN81aeLA5rHlaHJQQH5NK5umG9sWj-_kcZE9jrZ8ItPaE9DnobvkjAsNJegkRXBC7EWmtVwiRKCYjrb8",
});

const app = express();
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

app.post("/pay", (req, res) => {
  console.log("payment is going on");
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhoat:3000/pay",
      cancel_url: "http://cancel.url",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: "1.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "1.00",
        },
        description: "This is the payment description.",
      },
    ],
  };
  //   console.log("create_payment_json",create_payment_json)

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.log("an error occured");
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/pay", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: "Appended to redirected url",
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "1.00",
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
      if(error){
          console.log(error.response);
          throw error;
      }
      else{
      console.log("Get payment Response")
      console.log(JSON.stringify(payment))
      }
  })
});

app.listen(3000, () => console.log("Server Started"));
