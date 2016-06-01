let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Promise = require('bluebird');

let resultHandler = function (handlerConfig) {
  let setup = function () {
    handlerConfig = handlerConfig || {};
    this.handlerConfig = handlerConfig;
    return Promise.resolve(this);
  };
  return Promise.try(setup.bind(this));
};

resultHandler.prototype.handleResult = function(attributes) {
    return function (resAttributes) {
        _.merge(attributes, resAttributes);
        let index = attributes.index;
        winston.debug('#' + index + ' console result handler resolving');
        if (config.invalidIfRedirected && attributes.redirected) {
            winston.notice("#" + index + "  " + "Download Link Invalid. Final URL: " + attributes.url) ;
            winston.notice("#" + index + "  " + "Reason: Redirected not allowed.");
        } else {
          if (attributes.valid) {
              winston.info("#" + index + "  " + "Download Valid. URL: " + attributes.url);
              if (attributes.redirected) {
                  winston.notice("#" + index + "  " + "Redirects were detected.");
              }
          } else {
              winston.notice("#" + index + "  " + "Download Link Invalid. URL: " + attributes.url);
              winston.notice("#" + index + "  " + "Reason: " + attributes.reason);
          }
        }
        return attributes;
     };
}

resultHandler.prototype.handleError = function (err) {
  //error is already logged via winston in app.js, so no need to do it here.
  return;
}

resultHandler.prototype.handleNoServiceSupport = function (hostname) {
    this.handleError("No service support for " + hostname);
}

resultHandler.prototype.handleLastVerification = function () {
  return;
}

module.exports = resultHandler;
