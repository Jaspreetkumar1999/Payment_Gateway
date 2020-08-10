const express = require("express");
const ejs = require("ejs");
var paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AQwhlsk0aS1dGJEGITbyYR8gFw-xvO_PkS6AxbTWnFH8Oxsn0I_IGQoSFZ_vJBLsfIF9sjHNFber50lV",
  client_secret:
    "EGoBh9M0lF_89KU8MW58BXrkKolI67OzyIA0FVdhJPH7P3XM1nWFP-ETMsjtzCOek0Fy59JDFeuFNKpZ",
});

const app = express();
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

app.post("/pay", (req, res) => {
  console.log("payment is going on");
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Oakmont Hoa fee",
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
      throw error; }
     else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
    // else{
    //   console.log("Create Payment Response")
    //   console.log(payment)
    //   res.send('test');
    // }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: payerId,
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
      res.send('Success')
      }
  })
});
app.get('/cancel', (req,res)=> res.send('Cancelled'));

app.listen(3000, () => console.log("Server Started"));
