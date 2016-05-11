let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');

let resultHandler = function (handlerConfig) {
  handlerConfig = handlerConfig || {};
  this.handlerConfig = handlerConfig;
};

resultHandler.prototype.handleResult = function(attributes) {
    return function (resAttributes) {
        _.merge(attributes, resAttributes);
        let index = attributes.index
        if (config.invalidIfRedirected && attributes.redirected) {
            winston.notice("#" + index + "  " + "Download Link Invalid. Final URL: " + attributes.url) ;
            winston.notice("#" + index + "  " + "Reason: Redirected not allowed.");
        }

        if (attributes.valid) {
            winston.info("#" + index + "  " + "Download Valid. URL: " + attributes.url);
        } else {
            winston.notice("#" + index + "  " + "Download Link Invalid. URL: " + attributes.url);
            winston.notice("#" + index + "  " + "Reason: " + attributes.reason);
        }
        if (attributes.redirected) {
            winston.notice("#" + index + "  " + "Redirects were detected.");
        }
        return attributes;
     };
}

resultHandler.prototype.handleError = function (err) {
    winston.error(err);
}

resultHandler.prototype.handleNoServiceSupport = function (hostname) {
    handleError("No service support for " + hostname);
}

resultHandler.prototype.handleLastVerification = function () {
  return;
}

module.exports = resultHandler;
