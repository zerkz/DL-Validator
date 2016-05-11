let request = require('request-promise');
let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');

let resultHandler = function (handlerConfig) {
  handlerConfig = handlerConfig || {};
  this.handlerConfig = handlerConfig;
  this.compiledTemplates = {
    invalidMessageFormat : compileTemplates(handlerConfig.invalidMessageFormat),
    redirectMessageFormat : compileTemplates(handlerConfig.redirectMessageFormat)
  };
};



resultHandler.prototype.handleResult = function (attributes) {
    var slackIncomingWebHook = this.handlerConfig.IncomingWebHookURL;
    if (!slackIncomingWebHook) {
      throw "No Slack Incoming Webhook defined in json config.";
    }
    return function (resAttributes) {
      //merge attributes with attribs from the response.
        _.merge(attributes, resAttributes);
        let isDownloadValid = attributes.valid;
        let slackMessageFormatObj = this.compiledTemplates.invalidMessageFormat || ({ text :"Invalid Download Link. URL:{{url}}"});
        if (config.invalidIfRedirected && isDownloadValid && attributes.redirected) {
          isDownloadValid = false;
          attributes.redirectingHosts = attributes.redirectingHosts.join('\n');
          slackMessageFormatObj = this.compiledTemplates.invalidMessageFormat || '{{ text : "Uses Redirect. Replace with: {{url}}"}}';
        }
        if (!isDownloadValid) {
          var options = {
                method: 'POST',
                uri: slackIncomingWebHook,
                body: renderSlackPayload(slackMessageFormatObj, attributes),
                json: true // Automatically stringifies the body to JSON
            };
            request(options).then(function(body) {
              winston.debug('sent to slack!');
              return attributes;
            }).catch(function(err) {
              winston.error('failure sending to slack');
              winston.error(err);
            })
        }
     };
}

resultHandler.prototype.handleError = function (err) {
  let slackIncomingWebHook = this.handlerConfig.IncomingWebHookURL;
    if (slackIncomingWebHook.length <= 0) {
      throw "No Slack Incoming Webhook defined in handlerConfig.json.";
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
  } else if ( _.has(templateVal, "render")) {
   return templateVal.render(attribs);
  } else {
    throw "Invalid Type in Slack Message Format.";
  }
}

/** Compiles each of the possible templates in the slack message format object  **/
function compileTemplates (templateVal) {
  if (_.isArray(templateVal)) {
    return _.flatMap(templateVal, function(val) {
      return compileTemplates(val, attribs);
    });
  } else if (_.isObject(templateVal)) {
      return _.mapValues(templateVal, function (val) {
        return compileTemplates(val, attribs);
      });
  } else if ( _.isString(templateVal)) {
   return Hogan.compile(templateVal);
  } else {
    throw "Invalid Type in Slack Message Format.";
  }
}

resultHandler.prototype.handleNoServiceSupport = function (hostname) {
  //TODO
  return;
}

resultHandler.prototype.handleLastVerification = function () {
  return;
}

module.exports = resultHandler;
