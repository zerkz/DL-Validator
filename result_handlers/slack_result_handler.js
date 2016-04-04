'use strict';

let request = require('request-promise');
let config = require('../config.json');
let winston = require('winston');

function handleResult (attributes) {
    var slackIncomingWebHook = config.slackIncomingWebHook;
    if (slackIncomingWebHook.length <= 0) {
      throw "No Slack Incoming Webhook defined in config.json.";
    }
    return function (isDownloadValid) {
        if (!isDownloadValid) {
          var options = {
                method: 'POST',
                uri: slackIncomingWebHook,
                body: {
                    text: "Download Link Invalid. URL:" + attributes.url
                },
                json: true // Automatically stringifies the body to JSON 
            };
            request(options).then(function(body) {
              console.log('sent to slack!');
            }).catch(function(err) {
              console.error('failure sending to slack');
              console.error(err);
            })
        }
     };
}

function handleError (err) {
  var slackIncomingWebHook = config.slackIncomingWebHook;
    if (slackIncomingWebHook.length <= 0) {
      throw "No Slack Incoming Webhook defined in config.json.";
    }    
    var options = {
          method: 'POST',
          uri: slackIncomingWebHook,
          body: {
              text: "Error occured: " + err
          },
          json: true // Automatically stringifies the body to JSON 
    };
    request(options).then(function(body) {
      winston.debug("Sent error to slack");
      winston.debug(err);
    }).catch(function(err) {
      winston.error('failure sending error to slack');
      winston.error(err);
    });   
}

function handleNoServiceSupport(hostname) {
  return;    
}

module.exports = {
    handleResult : handleResult,
    handleError : handleError
}