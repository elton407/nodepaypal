const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ARUgjE8j2j5fqWPgU-gSVDIH-SheigKBmI3lTE9lT18C-06djj_VbZG053L4_ubkxWbcjsGS3-OLzlZC',
  'client_secret': 'EGxM2XOjAGp0iVwb1OfJl7sAji9FAPNVpaIJRBEwTl9brU9BMFD77Px11mDcHCydjcYZqT0FwdLFOI1V'
});

const app = express();

app.post('/pay', (req,res)=> {
	const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "01",
                "price": "75.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "75.00"
        },
        "description": "Orlando Magic Jersey"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
    	for (let i = 0; i < payment.links.length; i++) {
    		if (payment.links[i].rel === 'approval_url') {
    			res.redirect(payment.links[i].href);
    		}
    	}

    }
});

});

app.get('/success', (req, res)=>{
	const payerId = req.query.PayerID;
	const paymentId= req.query.paymentId;

const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "75.00"
        }
    }]
  };

paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment, null, 2));
        res.send('Success');
    }
});

});

app.get('/cancel', (req, res)=> res.send('Order Cancelled'));



app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.listen(3000, () => console.log ('server running on port: 3000'))
