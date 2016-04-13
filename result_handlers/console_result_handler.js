let config = require('../config.json');
let winston = require('winston');
let _ = require('lodash');

function handleResult (attributes) {
    return function (resAttributes) {
        _.merge(attributes, resAttributes);
        if (attributes.valid) {
            winston.info("Download Valid. URL:" + attributes.url);
        } else {
            winston.notice("Download Link Invalid. URL:" + attributes.url);
            winston.notice("Reason:" + attributes.reason);
        }
     };
}

function handleError (err) {
    console.error(err);
}

function handleNoServiceSupport(hostname) {
    handleError("No service support for " + hostname);
}

module.exports = {
    handleResult : handleResult,
    handleError : handleError,
    handleNoServiceSupport : handleNoServiceSupport
}