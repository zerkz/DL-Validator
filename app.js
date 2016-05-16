'use strict';
//blatant hack to load module before strict-mode enforced.
let GoogleSpreadsheet = require('google-spreadsheet');
require('use-strict');
let request = require('request-promise');
let pluginValidator = require('./plugin_validator');
let _ = require('lodash');
let config = require('./local-config.json') || require('/config.json');
let URL = require('url');
let proxy = require('./proxy');
let Promise = require('bluebird');
Promise.config = {
  warnings : true
};

function ConsumeRedirectError() {}
ConsumeRedirectError.prototype = Object.create(Error.prototype);

const serviceSupportersFolderName = "service_supporters";
const resultHandlersFolderName = "result_handlers";
const inputProcessorsFolderName = "input_processors";
let args = {};

let foundUnsupportedServices = {};
let retriesAllowed = config.retries || 0;

//setup logging.
let winston = require('winston');
winston.setLevels(winston.config.syslog.levels);
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  "level" : config.console_log_level || "error",
  colorize : true
});

//100mb max error log.
winston.add(winston.transports.File, {
  "name" : "error",
  "level" : "error",
  "filename" : "error.log",
  "maxsize" : 100000000,
  "prettyPrint" : true,
  "json" : true
});


let unsupportedServiceLogger = new (winston.Logger)({
  "level" : "notice",
  transports : [
   new (winston.transports.File)({
    "name" : "unsupported_services",
    "level" : "notice",
    "filename" : "unsupported_services.log",
    "maxsize" : 100000000,
    "prettyPrint" : true,
    "json" : true
  })]
});
unsupportedServiceLogger.setLevels(winston.config.syslog.levels);

let proxies = proxy.proxies;

//request.debug = true;
request = request.defaults({
  followRedirect : false,
  resolveWithFullResponse : true,
  simple : false,
  method : "GET",
  "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
  timeout : 20000,
  pool : {
    maxSockets : 5
  }
});

function getModulesInDir(dirName, validator) {
  var dirPath = require("path").join(__dirname, dirName);
  var modules = {};
   require("fs").readdirSync(dirPath).forEach(function(file) {
    var module = require(dirPath + '/' + file);
    validator(module, function(err) {
      if (err) {
        winston.error("Plugin :" + file + "-- " + err);
      }
    });
    modules[file.substring(0, file.length - 3)] = require(dirPath + '/' + file);
  });
   return modules;
}

var serviceSupporters = getModulesInDir(serviceSupportersFolderName, pluginValidator.validateServiceSupporter);
var resultHandlers = getResultHandlers();
var inputProcessors = getModulesInDir(inputProcessorsFolderName, pluginValidator.validateInputProcessor);

function getResultHandlers() {
  let resultHandlerPlugins = getModulesInDir(resultHandlersFolderName, pluginValidator.validateResultHandler);
  let resultHandlerConfigs = config.resultHandlers || {};
  let resultHandlers = [];
  _.forOwn(resultHandlerConfigs, function (config, key) {
    config.name = key;
    if (!_.has(config, "enabled") || !_.has(config, "type")) {
      throw "Result Handler Config does not have enabled and/or type set";
    }
    if (config.enabled) {
      resultHandlers.push(new resultHandlerPlugins[config.type](config));
    }
  });
  return resultHandlers;
}

function identifyProvider(url, serviceSupporters) {
  var linkHostName = URL.parse(url).hostname;
  return _.find(serviceSupporters, function (serviceSupporter) {
    let matchesHost = _.some(serviceSupporter.hostNames, function(hostName) {
      return hostName === linkHostName;
    });
    if (!matchesHost && serviceSupporter.hostNameRegexes) {
      _.forEach(serviceSupporter.hostNameRegexes, function (regex) {
        let matched = (new RegExp(regex)).test(linkHostName);
        if (matched == true) {
          matchesHost = true;
          //found a match, now break
          return false;
        }
      });
    }
    return matchesHost;
  });
}

function verifyDownload(url, resultHandlers, attribs, isLastVerification, retriesLeft) {
  let serviceSupporter = identifyProvider(url, serviceSupporters);
  if (serviceSupporter) {
    var reqOpts = getReqOpts(serviceSupporter, url);
    if (proxies.enabled) {
      reqOpts.proxy = proxy.getRandomProxy();
      reqOpts.tunnel = false;
      winston.debug("using proxy:" + reqOpts.proxy);
    }
    attribs = attribs || {} ;
    attribs.proxy = reqOpts.proxy;
    attribs.url = url;
    reqOpts.uri = url;
    //base attributes
    attribs.serviceSupporter = serviceSupporter.name;

    let promise = request(reqOpts).promise()
    .then(serviceSupporter.verifyDownloadExists)
    .then(function checkRedirectServices(resAttribs) {
      if (resAttribs.redirectedURL) {
        winston.debug('#' + attribs.index + '  ' +  'Redirected URL:' + resAttribs.redirectedURL);
        //we've been redirected atleast once, set the flag.
        attribs.redirected = true;
        attribs.redirectingHosts.push(URL.parse(url).hostname);
        verifyDownload(resAttribs.redirectedURL, resultHandlers, attribs, isLastVerification, retriesLeft);
        //TODO:add maximum redirects allowed.
        throw new ConsumeRedirectError;
      }
      return resAttribs;
    }).then(function (resAttribs) {
      return Promise.all(_.map(resultHandlers, function (resultHandler) {
        //TODO:need to clean this up so it isn't so ugly (refactor promises with spread and combine attribs)
        return resultHandler.handleResult(attribs)(resAttribs);
      }));
    }).catch(ConsumeRedirectError, function () {
      winston.info('#' + attribs.index + ' following redirect from redirect service...');
    }).catch(function (err) {
        if (retriesLeft <= 0) {
          let errorObj = {url : url};
          if (reqOpts.proxy) {
            errorObj.proxy = reqOpts.proxy;
          }
          winston.error(err, errorObj);
        } else {
          winston.notice('retrying: #' + (retriesAllowed - retriesLeft) +  ":" + url);
          verifyDownload(url, resultHandlers, attribs, isLastVerification, retriesLeft - 1);
        }
      }).finally(function () {
        if (isLastVerification) {
          //fire "end hook" if result handler requires...
          _.forEach(resultHandlers, function (resultHandler) {
            if (resultHandler.handleLastVerification) {
              resultHandler.handleLastVerification();
            }
          });

          unsupportedServiceLogger.notice("--Unsupported Services Summary--", { unsupportedServices : foundUnsupportedServices});
          unsupportedServiceLogger.notice("=====finish run=====");
          unsupportedServiceLogger.notice("====================");
        }
    });
  } else {
      addUnsupportedService(url, resultHandlers, attribs);
  }
}

function getReqOpts(serviceSupporter, url) {
  if (serviceSupporter.setupRequest) {
    return serviceSupporter.getCustomRequest(url);
  }
  return serviceSupporter.reqOpts || {};
}

 function addUnsupportedService(url, resultHandlers, attribs) {
    let unsupportedServiceHost = URL.parse(url).hostname;
    if (!foundUnsupportedServices[unsupportedServiceHost]) {
      foundUnsupportedServices[unsupportedServiceHost] = 1;
      unsupportedServiceLogger.notice('No support found for file service: ' + url);
      _.forEach(resultHandlers, function (resultHandler) {
        if (resultHandler.handleNoServiceSupport) {
          resultHandler.handleNoServiceSupport("No support found for file service.", attribs);
        }
      });
    } else {
      foundUnsupportedServices[unsupportedServiceHost] = foundUnsupportedServices[unsupportedServiceHost] + 1;
    }
 }

function run(inputProcessor) {
  unsupportedServiceLogger.notice("=====start run=====");
  unsupportedServiceLogger.notice("===================");

  inputProcessor.getDownloadLinks(function(error, linkKeyName, attribs) {
    if (error) {
      return winston.error("error'd" + error.message);
    }
    for(var i = 0; i < attribs.length;i++) {
      let result = attribs[i];
      result.redirectingHosts = [];
      let link = result[linkKeyName];
      winston.debug('#' + i + '  processing ' + link);
      try {
        let isLastVerification = (i === (attribs.length - 1));
        if (config.delay && !isNaN(config.delay)) {
          result.index = i;
          setTimeout(verifyDownload(link, resultHandlers, result, isLastVerification, retriesAllowed),
            config.delay);
        }  else {
          verifyDownload(link, resultHandlers, result, isLastVerification, retriesAllowed);
        }
      } catch (e) {
        winston.error(e, { url: link});
      }
    }
  });
}

//run(inputProcessors.simple);
run(inputProcessors["sql_db"]);
