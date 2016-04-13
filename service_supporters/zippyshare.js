var cheerio = require('cheerio');

module.exports = {
    name : "zippyshare",
    verifyDownloadExists : function (res) {
      let attributes = {
        valid : true
      };
      let $ = cheerio.load(res.body);
      let fileNotFoundDiv = $('#lrbox').find('div:contains("File does not exist on this server")');
      if (fileNotFoundDiv.length > 0) {
          attributes.valid = false;
          attributes.reason = "Not Found/404";
      }
      return attributes;
    },
    hostNames : ["zippyshare.com", "www.zippyshare.com"],
    hostNameRegexes : ["www[0-9]{1,8}\.zippyshare\.com"]
}