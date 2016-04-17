let util = require('../util.js');

//TODO: This could be thrown into direct_file.js
module.exports = {
  name : "Copy.com",
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

  hostNames : ["www.copy.com", "copy.com"]
}