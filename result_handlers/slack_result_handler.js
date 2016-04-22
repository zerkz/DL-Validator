'use strict';

let request = require('request-promise');
let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');


function handleResult (attributes) {
    var slackIncomingWebHook = config.slack.IncomingWebHookURL;
    if (slackIncomingWebHook.length <= 0) {
      throw "No Slack Incoming Webhook defined in config.json.";
    }
    return function (isDownloadValid, resAttributes) {
      //merge attributes with attribs from the response.
        _.merge(attributes, resAttributes);
        
        let slackMessageFormatObj = config.slack.messageFormat || ({ text :"Invalid Download Link. URL:{{url}}"});
        slackMessageFormatObj = renderSlackPayload(slackMessageFormatObj, attributes);
        if (!isDownloadValid) {
          var options = {
                method: 'POST',
                uri: slackIncomingWebHook,
                body: renderSlackPayload(slackMessageFormatObj, attributes),
                json: true // Automatically stringifies the body to JSON 
            };
            request(options).then(function(body) {
              winston.debug('sent to slack!');
            }).catch(function(err) {
              winston.error('failure sending to slack');
              winston.error(err);
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

/** Runs each value in the messageFormat object  **/
function renderSlackPayload (templateVal, attribs) {
  if (_.isArray(templateVal)) {
    return _.flatMap(templateVal, function(val) {
      return renderSlackPayload(val, attribs);
    });
  } else if (_.isObject(templateVal)) {
      return _.mapValues(templateVal, function (val) {
        return renderSlackPayload(val, attribs);
      });
  } else if ( _.isString(templateVal) || _.isNumber(templateVal)) {
   return Hogan.compile(templateVal).render(attribs);
  } else {
    throw "Invalid Type in Slack Message Format.";
  }
}

/** Compiles each of the possible templates in the slack message format object  **/
function compileTemplates (messageFormat) {
  //TODO
}

function handleNoServiceSupport(hostname) {
  //TODO
  return;    
}

module.exports = {
    handleResult : handleResult,
    handleError : handleError,
    handleNoServiceSupport : handleNoServiceSupport,
}