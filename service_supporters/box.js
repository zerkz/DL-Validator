module.exports = {
	name : "Box",
	verifyDownloadExists : function (res) {
		if (res.statusCode == 404) {
			return false;
		} else {
			return true;
		}
	},
	hostNames : ["box.com", "app.box.com"]
}