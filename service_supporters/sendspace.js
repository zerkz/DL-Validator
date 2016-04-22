let cheerio = require('cheerio');
let util = require('../util');

module.exports = {
    name : "sendspace",
    verifyDownloadExists : function (res) {
      let attributes = {
        valid : true
      };
      let redirect = util.retrieveRedirect(res);
      if (redirect) {
        attributes.redirectedURL = redirect;
        return attributes;
      }
      let $ = cheerio.load(res.body);
      let fileNotFoundDiv = $('div.msg.error');
      if (fileNotFoundDiv.length > 0) {
          attributes.valid = false;
          attributes.reason = fileNotFoundDiv.html();
      }
      return attributes;
    },
    hostNames : ["sendspace.com", "www.sendspace.com"],
    hostNameRegexes : [".{1,8}\.sendspace\.com"]
}

