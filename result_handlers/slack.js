let request = require('request-promise');
let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');
let Promise = require('bluebird');

let resultHandler = function (handlerConfig) {
  let setup = function () {
    handlerConfig = handlerConfig || {};
    this.handlerConfig = handlerConfig;
    this.compiledTemplates = {
      invalidMessageFormat : compileTemplates(handlerConfig.invalidMessageFormat),
      redirectMessageFormat : compileTemplates(handlerConfig.redirectMessageFormat)
    };
    return Promise.resolve(this);
  };
  return Promise.try(setup.bind(this));
};



resultHandler.prototype.handleResult = function (attributes) {
    let slackIncomingWebHook = this.handlerConfig.incomingWebHookURL;
    let compiledTemplates = this.compiledTemplates;
    if (!slackIncomingWebHook) {
      throw "No Slack Incoming Webhook defined in json config.";
    }
    return function (resAttributes) {
      //merge attributes with attribs from the response.
        _.merge(attributes, resAttributes);
        let isDownloadValid = attributes.valid;

        let slackMessageFormatObj = compiledTemplates.invalidMessageFormat || ({ text :"Invalid Download Link. URL:{{url}}"});
        if (config.invalidIfRedirected && attributes.redirected) {
          attributes.redirectingHosts = attributes.redirectingHosts.join('\n');
          slackMessageFormatObj = compiledTemplates.redirectMessageFormat || '{{ text : "Uses Redirect. Replace with: {{url}}"}}';
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
              return attributes;
            })
        }
     };
}

resultHandler.prototype.handleError = function (err) {
  let slackIncomingWebHook = this.handlerConfig.incomingWebHookURL;
    if (slackIncomingWebHook && slackIncomingWebHook.length <= 0) {
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
  //check to see if it is a compiled template...
  if ( _.has(templateVal, "r")) {
   return templateVal.render(attribs);
  } else if (_.isArray(templateVal)) {
    return _.flatMap(templateVal, function(val) {
      return renderSlackPayload(val, attribs);
    });
  } else if (_.isObject(templateVal)) {
    return _.mapValues(templateVal, function (val) {
      return renderSlackPayload(val, attribs);
    });
  } else {
    console.error(Object.prototype.toString.call(templateVal));
    console.error(templateVal);
    throw "Invalid Type in Slack Message Format.";
  }
}

/** Compiles each of the possible templates in the slack message format object  **/
function compileTemplates (templateVal) {
  if (_.isArray(templateVal)) {
    return _.flatMap(templateVal, function(val) {
      return compileTemplates(val);
    });
  } else if (_.isObject(templateVal)) {
      return _.mapValues(templateVal, function (val) {
        return compileTemplates(val);
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
