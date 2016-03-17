var request = require('request-promise');
var serviceSupportersFolderName = "service_supporters";
var resultHandlersFolderName = "result_handlers";

request.debug = true;
request = request.defaults({
	"resolveWithFullResponse" : true,
	"simple" : false,
	"method" : "GET",
	"User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36"
});


function getModulesInDir(dirName) {
	var dirPath = require("path").join(__dirname, dirName);
	var modules = {};
	 require("fs").readdirSync(dirPath).forEach(function(file) {
		console.log(dirPath +'/' + file);
	  modules[file.substring(0, file.length - 3)] = require(dirPath + '/' + file);
	});
	 return modules;
}

var serviceSupporters = getModulesInDir(serviceSupportersFolderName);
var resultHandlers = getModulesInDir(resultHandlersFolderName);


function verifyDownload(url, serviceSupporter, resultHandler, attribs) {
	var reqOpts = serviceSupporter.reqOpts || {};
	attribs = attribs || {} ;
	attribs.url = url;
	reqOpts.uri = url;
	request(reqOpts)
		.then(serviceSupporter.verifyDownloadExists)
		.then(resultHandler(attribs));
}

verifyDownload("https://app.box.com/s/9op5op31jr8tvcb6b7bfeavr1npc6fbj", 
	serviceSupporters.box, resultHandlers.console_result_handler);







