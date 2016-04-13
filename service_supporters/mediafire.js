module.exports = {
  name : "Mediafire",
  verifyDownloadExists : function (res) {
    let redirect = res.headers.location;
    let attributes = {
      valid : true
    };
    if (redirect && redirect.indexOf('error.php') >= 0) {
      attributes.valid = false;
      attributes.reason = "Not Found/Expired/Error";
    } else if (redirect && redirect.indexOf('download_repair.php')) {
      attributes.valid = false;
      attributes.reason = "Needs Download Repair/Redirect. Replace with redirected URL.";
    }
    
    return attributes;
  },
  hostNames : ["www.mediafire.com", "mediafire.com"],
  hostNameRegexes : ["download[0-9]{1,8}\.mediafire\.com"]
}