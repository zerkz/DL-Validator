var cheerio = require('cheerio');

module.exports = {
	name : "Dropbox",
	verifyDownloadExists : function (res) {
		var $ = cheerio.load(res.body);
		var pageTitle = $('meta[property="og:title"]').attr('content') || '';
		if (pageTitle.toLowerCase().indexOf("link not found") >= 0) {
			return false;
		} else {
			return true;
		}
	},
	hostNames : ["www.dropbox.com", "dropbox.com"]
}