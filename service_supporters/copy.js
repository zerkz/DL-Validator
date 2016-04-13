module.exports = {
  name : "Copy.com",
  verifyDownloadExists : function (res) {
    let contentDisposition = res.headers['content-disposition'];
    let attributes = {
      valid : true
    };
    if (contentDisposition && (contentDisposition.indexOf('attachment') >= 0)) {
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