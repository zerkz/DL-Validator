let util = require('../util.js');


//general module for direct file links. relies on HEAD request to check content disposition.
module.exports = {
  name : "Direct Host/Download",
  verifyDownloadExists : function (res) {
    let attributes = {
      valid : true
    };
    if (util.isContentDispositionValid(res)) {
      return attributes;
    } else {
      attributes.valid = false;
      attributes.reason = "URL does not deliver a file/attachment.";
    }
    
    return attributes;
  },

  reqOpts : {
    "method" : "HEAD"
  },

  hostNames : ["dd.tt", "dl.dropboxusercontent.com"]
}