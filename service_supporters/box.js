module.exports = {
	verifyDownloadExists : function (res) {
		if (res.statusCode == 404) {
			return false;
		} else {
			return true;
		}
	}
}