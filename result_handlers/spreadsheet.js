let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');
let GoogleSpreadsheet = require('google-spreadsheet');


let headersWritten = false;

let resultHandler = function (handlerConfig) {
  handlerConfig = handlerConfig || {};
  this.handlerConfig = handlerConfig;
  this.creds = require('./keys/' + handlerConfig.keyFile);
  this.sheet = new GoogleSpreadsheet(handlerConfig.sheetId);
  this.sheet.doc(creds);
};

resultHandler.prototype.handleResult = function (attributes) {
    return function (resAttributes) {
        _.merge(attributes, resAttributes);
        let dataKeys = _.keys(attributes) ;
        if (headersWritten) {
          _.forEach(this.handlerConfig.headers, function (key, header) {
            if (_.has(header, "template")) {
              sheet.Hogan.compile(header.template).render(attributes);
            }
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
