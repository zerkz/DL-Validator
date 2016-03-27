var request = require('request-promise');

function handleResult (attributes) {
	return function (isDownloadValid) {
		if (!isDownloadValid) {
			//request('')
		}
	 };
}

function handleError (err) {
	console.error(err);
}

module.exports = {
	handleResult : handleResult,
	handleError : handleError
}