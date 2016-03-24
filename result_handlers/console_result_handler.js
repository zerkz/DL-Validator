module.exports = function (attributes) {
	return function (isDownloadValid) {
		if (isDownloadValid) {
			console.log("Download Valid. URL:" + attributes.url);
		} else {
			console.log("Download Invalid. URL:" + attributes.url);
		}
	};
}