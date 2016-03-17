module.exports = function (attributes) {
	return function (isDownloadValid) {
		if (isDownloadValid) {
			console.log("Download Valid. " + "Attribs: " + attributes.toString());
		} else {
			console.log("Download Invalid. " + "Attribs: " + attributes.toString());
		}
	};
}