'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates express http server

var logs = "";
// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log('webhook is listening'));

/*
// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 let token = "EAAIEGSysBfwBAPymtNowHuqQaZAV8vpU87vf8lVc4dcI4ptgZCPP8wF6n3UZAEVcyCy1qOAHi6fQHOYFy7YGwcrq1h0UD1iEDfrtwH3WAEnENXRKJYrfZAlZAAR4N0CUZBv4DpRJu4l0uzWaJaNlIwqivXsY4alprFlMBiZC0eOjgZDZD"
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
*/

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "botcoin"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


app.post('/webhook', (req, res) => {
    var now = new Date();
    var jsonDate = now.toJSON();
    console.log("post - webhook: " + jsonDate);
    var jsn = JSON.stringify(req.body);
    console.log("webhook: " + jsn);

    logs += jsn + "  ";

    // Make sure this is a page subscription
      if (req.body.object === 'page') {
          let messaging_events = req.body.entry[0].messaging;
      
      
      
        for (let i=0; i < messaging_events.length; i++){
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text){
        let text = event.message.text
        

        sendText(sender, "Text echo: " + text.substring(0, 100))
            }
          }
       
      
    res.sendStatus(200)
  }
});


function sendText(sender, text) {
  let messageData = {text: text}
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: token},
    method: "POST",
    json: {
      recipient: {user_ref: sender},
      message: messageData
    }
  }, function(error, response, body){
      if (error){
        console.log("sending error");
      } else if (response.body.error){
        console.log("response body error");
    }
  })
}



////////////////////////// DEV /////////////////////////////////////

app.get('/version', function(req, res) {
  console.log("get version - 1");

  res.send("version 1.0")
})

app.get('/logs', function(req, res) {
  console.log("get version - 1");

  res.send(logs)
})