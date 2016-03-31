var request = require('request-promise');
var config = require('../config.json');

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
    console.error(err);
}

module.exports = {
    handleResult : handleResult,
    handleError : handleError
}