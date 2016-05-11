var cheerio = require('cheerio');

module.exports = {
  name : "Dropbox",
  verifyDownloadExists : function (res) {
    let attributes = {
      valid : true
    };
    let $ = cheerio.load(res.body);
    let pageTitle = $('meta[property="og:title"]').attr('content') || '';
    if (pageTitle.toLowerCase().indexOf("link not found") >= 0) {
      attributes.valid = false;
      attributes.reason = "Not Found/404";
    }
    return attributes;
  },
  hostNames : ["www.dropbox.com", "dropbox.com"]
}