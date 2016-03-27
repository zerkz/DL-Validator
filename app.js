var request = require('request-promise');
var pluginValidator = require('./plugin_validator');
var _ = require('lodash');
var URL = require('url');
var serviceSupportersFolderName = "service_supporters";
var resultHandlersFolderName = "result_handlers";

//request.debug = true;
request = request.defaults({
  followRedirect : false,
  resolveWithFullResponse : true,
  simple : false,
  method : "GET",
  "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36"
});


function getModulesInDir(dirName, validator) {
  var dirPath = require("path").join(__dirname, dirName);
  var modules = {};
   require("fs").readdirSync(dirPath).forEach(function(file) {
    var module = require(dirPath + '/' + file);
    validator(module, function(err) {
      if (err) {
        console.error("error: " + err.message);
      }
    });
    modules[file.substring(0, file.length - 3)] = require(dirPath + '/' + file);
  });
   return modules;
}

var serviceSupporters = getModulesInDir(serviceSupportersFolderName, pluginValidator.validateServiceSupporter);
var resultHandlers = getModulesInDir(resultHandlersFolderName, pluginValidator.validateResultHandler);


function identifyProvider(url, serviceSupporters) {
  var linkHostName = URL.parse(url).hostname;
  console.log(linkHostName);
  return _.find(serviceSupporters, function (serviceSupporter) {
    return _.some(serviceSupporter.hostNames, function(hostName) {
      return hostName === linkHostName;
    });
  });
}

function verifyDownload(url, resultHandler, attribs) {
  var serviceSupporter = identifyProvider(url, serviceSupporters);
  if (serviceSupporter) {
    var reqOpts = getReqOpts(serviceSupporter, url);
    attribs = attribs || {} ;
    attribs.url = url;
    reqOpts.uri = url;
    request(reqOpts)
      .then(serviceSupporter.verifyDownloadExists)
      .then(resultHandler.handleResult(attribs));
  } else {
    resultHandler.handleError("No support found for file service.", attribs);
  }
}

function getReqOpts(serviceSupporter, url) {
  if (serviceSupporter.setupRequest) {
    return serviceSupporter.getCustomRequest(url);
  } 
  return serviceSupporter.reqOpts || {};
}

verifyDownload("https://app.box.com/s/9op5op31jr8tvcb6b7bfeavr1npc6fbj", 
  resultHandlers.console_result_handler);

verifyDownload("https://drive.google.com/file/d/0B_TdR95roKpZN2dmS0xsb1pDVFU/view?usp=sharing", 
  resultHandlers.console_result_handler);

verifyDownload("http://www.mediafire.com/download/jji8b2g6dl1lbgx", 
  resultHandlers.console_result_handler);

verifyDownload("https://www.dropbox.com/s/ospwuey103088qv/Disturbed_Stricken_666.psarc?dl=0", 
  resultHandlers.console_result_handler);





