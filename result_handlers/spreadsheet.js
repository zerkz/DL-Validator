let config = require('../local-config.json') || require('../config.json');
let winston = require('winston');
let _ = require('lodash');
let Hogan = require('hogan.js');
let GoogleSpreadsheet = require('google-spreadsheet');
let Promise = require('bluebird');
let headersWritten = false;

let resultHandler = function (handlerConfig) {
  let setup = function () {
    this.handlerConfig = handlerConfig;
    this.creds = require('../keys/' + handlerConfig.keyFile);
    return setupSheet(handlerConfig, this.creds)
    .then(function(sheet) {
      this.sheet = Promise.promisifyAll(sheet);
      return Promise.resolve(this);
    }.bind(this)).catch(function (err) {
      winston.error(err);
      throw "Failed to create Google Spreadsheet";
    });
  };
  return Promise.try(setup.bind(this));
};

function setupSheet(handlerConfig, keyFile) {
  let sheet = Promise.promisifyAll(new GoogleSpreadsheet(handlerConfig.sheetId));
  let title = handlerConfig.title;
  let rowCount = handlerConfig.rowCount|| 100;
  let columnCount = handlerConfig.columnCount || 20
  let headers = _.keys(handlerConfig.headers || {});
  let opt = {
    "title" : title || "Invalid Links",
    "headers" : headers,
    "rowCount" : rowCount ,
    "columnCount" : columnCount
  };
  opt.title += " " + new Date().toString();
  //jesus this is a clusterfuck
  return sheet.useServiceAccountAuthAsync(keyFile).then(function () {
    //basically, we add a worksheet, and then delete all worksheets that don't already have this name.
    return sheet.addWorksheetAsync(opt).then(function (newWorkSheet) {
      return sheet.getInfoAsync().then(function(info) {
          let deletes = Promise.map(info.worksheets, function (worksheet) {
            if (worksheet.title != opt.title) {
              Promise.promisifyAll(worksheet);
              return worksheet.delAsync();
            }
          });
          return Promise.all(deletes).then(function () {
            return newWorkSheet;
          });
      });
    });
  });
}

resultHandler.prototype.handleResult = function (attributes) {
    if (!this.sheet) {
      throw 'Something screwed up spreadsheet preload';
    } else {
      return function (resAttributes) {
          _.merge(attributes, resAttributes);
          let isDownloadValid = attributes.valid;
          winston.debug('spreadsheet handling #' + attributes.index + "with valid=" + isDownloadValid);
          if (!isDownloadValid) {
            let row = _.mapValues(this.handlerConfig.headers, function (val, key, headers) {
              let cellValue;

              if (_.has(val, 'template')) {
                return Hogan.compile(val.template).render(attributes);
              } else {
                let nonTemplateValue = attributes[val] || "";
                if (_.isArray(nonTemplateValue)) {
                  nonTemplateValue = nonTemplateValue.join(',');
                }
                return nonTemplateValue;
              }
            });
            this.sheet.addRowAsync(row, function(err) {
              if (err) {
                winston.error(err, 'Failed to add row #' + attributes.index + ' to spreadsheet.');
                return attributes;
              } else {
                winston.debug('added #' + attributes.index + " to spreadsheet!");
                return attributes;
              }
            });
          } else {
            return attributes;
          }
       }.bind(this);
    }

}

resultHandler.prototype.handleError = function (err) {
  //writing errors to a spreadsheet? you're asking for hell.
  return;
}

resultHandler.prototype.handleNoServiceSupport = function (hostname) {
  //TODO: Implement some sort of extra sheet to do this?
  return;
}

resultHandler.prototype.handleLastVerification = function () {
  return;
}

module.exports = resultHandler;
