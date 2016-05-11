let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');
let GoogleSpreadsheet = require('google-spreadsheet');


let headersWrittern = false;

let resultHandler = function (handlerConfig) {
  handlerConfig = handlerConfig || {};
  this.handlerConfig = handlerConfig;
  this.workbook = null;
};



resultHandler.prototype.handleResult = function (attributes) {
    return function (resAttributes) {
        _.merge(attributes, resAttributes);
        let dataKeys = handlerConfig.dataKeysToWrite || _.keys(attributes) ;
        if (!headersWrittern) {
          _.forEach(dataKeys, function(key, index) {
            sheet.push({ c : index, r: 0, v: attributes[key]})
          });
        } else {
          sheet.push({ c : index, r: 0, v: attributes[key]})
        }

     };
}

resultHandler.prototype.handleError = function (err) {
    winston.error(err);
}

resultHandler.prototype.handleNoServiceSupport = function (hostname) {
    this.handleError("No service support for " + hostname);
}

resultHandler.prototype.handleLastVerification = function () {
  return;
}

module.exports = resultHandler;
