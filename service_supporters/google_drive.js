module.exports = {
  "name" : "Google Drive",
  verifyDownloadExists : function (res) {
    if (res.statusCode == 404) {
      return false;
    } else {
      return true;
    }
  },
  hostNames : ["drive.google.com"]
}