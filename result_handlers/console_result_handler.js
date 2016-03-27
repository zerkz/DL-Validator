function handleResult (attributes) {
	return function (isDownloadValid) {
		if (isDownloadValid) {
			console.log("Download Valid. URL:" + attributes.url);
		} else {
			console.log("Download Invalid. URL:" + attributes.url);
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