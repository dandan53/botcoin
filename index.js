'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express().use(bodyParser.json()); // creates express http server

var logs = "";
// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log('webhook is listening'));


var usersToMessages = {};
//associativeArray["one"] = "First";

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
            let text = event.message.text;
            
            if ((sender in usersToMessages) === false){
              // "HI", "BUYSELL", "AMOUNT", "LOCATION"
                usersToMessages[sender] = {state: "HI", messages: []};
            }

            usersToMessages[sender].messages.push(text);
            let state = usersToMessages[sender].state;

            var txt = "";

             switch(state) {
              case "HI":
                   txt = "Hi";
                   sendText(sender, txt);

                   sendGenericAlert(sender);

                   usersToMessages[sender].state = "BUYSELL";
           
                  break;
            /*  case "BUYSELL":
                   txt = "How many bitcoins?";
                   sendText(sender, txt);

                   usersToMessages[sender] = "AMOUNT";

                  break; */
              case "AMOUNT":
                   txt = "Where are you from?";
                   sendText(sender, txt);

                   usersToMessages[sender].state = "LOCATION";

                  break;
              case "LOCATION":
                   txt = "We will search for you and get back to you. Thanks and goodbye!";
                   sendText(sender, txt);

                   delete usersToMessages[sender].state;

                  break;
              default:
                   txt = "Still looking for maching...";
                   sendText(sender, txt);

                   usersToMessages[sender].state = "DONE";
              }   
                          
          } else if (event.postback && event.postback.payload){
            let payload = event.postback.payload;
            
            usersToMessages[sender].messages.push(payload);

            switch(payload) {
              case "buy":
                   txt = "How many bitcoins?";
                   sendText(sender, txt);

                   usersToMessages[sender].state = "AMOUNT";
           
                  break;
              case "sell":
                   txt = "How many bitcoins?";
                   sendText(sender, txt);

                   usersToMessages[sender].state = "AMOUNT";

                  break;
              default:
                 //"deault"
              }
          }
         
      
      res.sendStatus(200)
      //res.send("message: " + jsn)
    }
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


var sendGenericAlert1 = function (sender) {
     var messageData = buildGeneralMessageAlert1();
    if (messageData) {
        sendMessage2(sender, messageData);
    }
}


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
        "text":"Do you want to buy or sell bitcoin?",
        "buttons":[
          {
            "type":"postback",
            "title":"BUY",
            "payload":"buy"
          },
          {
            "type":"postback",
            "title":"SELL",
            "payload":"sell"
          }
        ]
      }
    }
  }

    return messageData;

};


var buildGeneralMessageAlert1 = function () {
    
 var messageData =
 {
    
      "payload":{
        "template_type":"button",
        "text":"Do you want to buy or sell bitcoin?",
        "buttons":[
          {
            "type":"postback",
            "title":"BUY",
            "payload":"buy"
          },
          {
            "type":"postback",
            "title":"SELL",
            "payload":"sell"
          }
        ]
      }
    }

    return messageData;
};


var buildGeneralMessageAlert2 = function () {
    
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


app.get('/all', function(req, res) {
  
  var users = "";

  for(var key in usersToMessages) {
    var sender = key;

    users += sender + ", ";

    var txt = "We have a match!";
    sendText(sender, txt);
 }

  res.send(users);
})


////////////////////////// DEV /////////////////////////////////////

app.get('/version', function(req, res) {
  console.log("get version - 1");

  res.send("version 1.1")
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