'use strict';
require('use-strict');
var request = require('request-promise');
var pluginValidator = require('./plugin_validator');
var math = require('mathjs');
var _ = require('lodash');
var config = require('./local-config.json') || require('/config.json');
var URL = require('url');
var proxy = require('./proxy');
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


let unsupportedServiceLogger =  new (winston.Logger)({
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

let proxies = proxy.getProxiesFromConfig() || [];

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
        winston.error(err);
      }
    });
    modules[file.substring(0, file.length - 3)] = require(dirPath + '/' + file);
  });
   return modules;
}

var serviceSupporters = getModulesInDir(serviceSupportersFolderName, pluginValidator.validateServiceSupporter);
var resultHandlers = getModulesInDir(resultHandlersFolderName, pluginValidator.validateResultHandler);
var inputProcessors = getModulesInDir(inputProcessorsFolderName, pluginValidator.validateInputProcessor);

let chosenResultHandler = getResultHandler();

function getResultHandler() {
  return resultHandlers.console_result_handler;
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

function verifyDownload(url, resultHandler, attribs, isLastVerification, retriesLeft) {
  let serviceSupporter = identifyProvider(url, serviceSupporters);
  if (serviceSupporter) {
    var reqOpts = getReqOpts(serviceSupporter, url);
    if (proxy && proxy.enabled && proxies.length > 0) {
      reqOpts.proxy = getRandomProxy();
      reqOpts.tunnel = false;
      winston.debug("using proxy:" + reqOpts.proxy);
    }
    attribs = attribs || {} ;
    attribs.proxy = reqOpts.proxy;
    attribs.url = url;
    reqOpts.uri = url;
    request(reqOpts)
      .then(serviceSupporter.verifyDownloadExists)
      .then(resultHandler.handleResult(attribs))
      .catch(function (err) {
        if (retriesLeft <= 0) {
          winston.error(err.message, {url : url});
        } else {
          winston.notice('retrying: #' + (retriesAllowed - retriesLeft) +  ":" + url);
          verifyDownload(url, resultHandler, attribs, isLastVerification, retriesLeft - 1);
        }
      }).finally(function () {
        if (isLastVerification) {
          unsupportedServiceLogger.notice("--Unsupported Services Summary--", { unsupportedServices : foundUnsupportedServices});
          unsupportedServiceLogger.notice("=====finish run=====");
          unsupportedServiceLogger.notice("====================");
        }
    });
  } else {
    let unsupportedServiceHost = URL.parse(url).hostname;
    if (!foundUnsupportedServices[unsupportedServiceHost]) {
      foundUnsupportedServices[unsupportedServiceHost] = 1;
      unsupportedServiceLogger.notice('No support found for file service: ' + url);
      resultHandler.handleError("No support found for file service.", attribs);
    } else {
      foundUnsupportedServices[unsupportedServiceHost] = foundUnsupportedServices[unsupportedServiceHost] + 1;
    }    
  }
}

function getReqOpts(serviceSupporter, url) {
  if (serviceSupporter.setupRequest) {
    return serviceSupporter.getCustomRequest(url);
  }
  return serviceSupporter.reqOpts || {};
}

function getRandomProxy() {
  if (proxies.length != 0) {
    var random = math.floor(math.random(0,proxies.length -1));
    return proxies[random];
  } else {
    return false;
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
      let link = result[linkKeyName];
      winston.debug('processing ' + link);
      try {
        let isLastVerification = (i === (attribs.length - 1));
        if (config.delay && !isNaN(config.delay)) {
          setTimeout(verifyDownload(link, chosenResultHandler, attribs[i], isLastVerification, retriesAllowed),
            config.delay);
        }  else {
          verifyDownload(link, chosenResultHandler, attribs[i], isLastVerification, retriesAllowed);
        } 
      } catch (e) {
        winston.error(e.message, { url: link});
      }
    }
  });
}

run(inputProcessors.simple);
//run(inputProcessors["sql_db"]);


// verifyDownload("https://app.box.com/s/9op5op31jr8tvcb6b7bfeavr1npc6fbj", 
//   resultHandlers.console_result_handler, {});

// verifyDownload("https://drive.google.com/file/d/0B_TdR95roKpZN2dmS0xsb1pDVFU/view?usp=sharing", 
//   resultHandlers.console_result_handler, {});

// verifyDownload("http://www.mediafire.com/download/jji8b2g6dl1lbgx", 
//   resultHandlers.console_result_handler, {});

// verifyDownload("https://www.dropbox.com/s/ospwuey103088qv/Disturbed_Stricken_666.psarc?dl=0", 
//   resultHandlers.slack_result_handler, {});




