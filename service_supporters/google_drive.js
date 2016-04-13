module.exports = {
  "name" : "Google Drive",
  verifyDownloadExists : function (res) {
    let attributes = {
      valid : true
    };
    if (res.statusCode == 404) {
      attributes.valid = false;
    }
    return attributes;
  },
  hostNames : ["drive.google.com"]
}