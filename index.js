'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express().use(bodyParser.json()); // creates express http server

var logs = "";
// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log('webhook is listening'));


 let token = "EAAIEGSysBfwBAPymtNowHuqQaZAV8vpU87vf8lVc4dcI4ptgZCPP8wF6n3UZAEVcyCy1qOAHi6fQHOYFy7YGwcrq1h0UD1iEDfrtwH3WAEnENXRKJYrfZAlZAAR4N0CUZBv4DpRJu4l0uzWaJaNlIwqivXsY4alprFlMBiZC0eOjgZDZD";


/*
// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
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

    logs += "  " + jsn;

    // Make sure this is a page subscription
      if (req.body.object === 'page') {
         let messaging_events = req.body.entry[0].messaging;
      
    
      
        for (let i=0; i < messaging_events.length; i++){
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text){
        let text = event.message.text
        

        var txt = "Hi";
        if (text === "Hi" || text === "hi"){
          txt = "Hi, Do you want to buy or sell Bitcoin?"
        }
        else if (text === "buy" || text === "sell" ){
          txt = "How many?"
        }
        //else if (/^\d+$//.test(text)){
          else if (isNaN(i)){
          txt = "Where are you from?"
        }
        else{
          txt = "Great. I will contact you soon for a deal. Thank you!"
        }

        sendGenericAlert(sender)

        //sendText(sender, txt)

        //sendText(sender, "Text echo: " + text.substring(0, 100))
            }
         }
       
      
      res.sendStatus(200)
      //res.send("message: " + jsn)
    }

  
});


function sendText(sender, text) {
  let messageData = {text: text}
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: token},
    method: "POST",
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function(error, response, body){
      if (error){
        console.log("sending error - " + error);
      } else if (response.body.error){
        var jsn = JSON.stringify(response.body.error);
        console.log("response body error - " + jsn);
    }
  })
}

///////////////////// msg /////////////////////////////////////////


var sendGenericAlert = function (sender) {
     var messageData = buildGeneralMessageAlert();
    if (messageData) {
        sendMessage2(sender, messageData);
    }
}

var buildGeneralMessageAlert = function () {
    
 var messageData =
 {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"What do you want to do next?",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://chatbotcoins.herokuapp.com/version",
            "title":"Visit Messenger"
          }
        ]
      }
    }
  }

    return messageData;

};




function sendMessage2(sender, messageData) {
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: token},
        method: 'POST',
         json: {
        recipient: {id: sender},
        message: messageData
      }
    }, function(error, response, body) {
        console.log(body);
        if (error) {
            console.log(error);
        }
       // callback();
    });
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


app.get('/message', function(req, res) {
    console.log("get message");

   // sendText(1991939677488552, "token"); 
    sendGenericAlert(1991939677488552);
    res.send("Done!")
})

app.get('/privacy', function(req, res) {
  console.log("get version - 1");

  res.send("version 1.0")
})