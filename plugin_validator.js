var parambulator = require('parambulator');

var serviceSupporterChecker = parambulator({ 
  'required$' : ['name', 'verifyDownloadExists', 'hostNames'],
  name : { 'type$' : 'string'},
  verifyDownloadExists : {  type$:'function'  },
  hostNames : { '*' : { 'type$' : 'string' }},
  hostNamesRegex : { '*' : { 'type$' : 'string' }}
});

var resultHandlerChecker = parambulator({ 
  'required$' : ['handleError', 'handleResult'],
  handleError : {type$:'function'},
  handleResult : {type$:'function'},
  handleNoServiceSupport : {'type$' :'function'}
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