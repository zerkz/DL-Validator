var parambulator = require('parambulator');

var serviceSupporterChecker = parambulator({
  'required$' : ['name', 'verifyDownloadExists', 'hostNames'],
  name : { 'type$' : 'string'},
  verifyDownloadExists : {  type$:'function'  },
  hostNames : { '*' : { 'type$' : 'string' }},
  hostNamesRegex : { '*' : { 'type$' : 'string' }}
});

var resultHandlerChecker = parambulator({
  prototype : {
    handleError : {type$:'function', required$ : true},
    handleResult : {type$:'function', required$ : true},
    handleNoServiceSupport : {'type$' :'function'},
    handleLastVerification : { 'type$' : 'function'}
  }
});

var inputProcessorChecker = parambulator({});

module.exports = {
  validateServiceSupporter : function (serviceSupporter, errCallback) {
    serviceSupporterChecker.validate(serviceSupporter, errCallback);
  },
  validateResultHandler : function (resultHandler, errCallback) {
    resultHandlerChecker.validate(resultHandler, errCallback);
  },
  validateInputProcessor : function (inputProcessor, errCallback) {
    inputProcessorChecker.validate(inputProcessor, errCallback);
  }
 }
