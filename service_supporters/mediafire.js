module.exports = {
	name : "Mediafire",
	verifyDownloadExists : function (res) {
		var redirect = res.headers.location;
		if (redirect && redirect.indexOf('error.php') >= 0) {
			return false;
		} else {
			return true;
		}
	},
	hostNames : ["www.mediafire.com", "mediafire.com"]
}