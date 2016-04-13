module.exports = {
    name : "Box",
    verifyDownloadExists : function (res) {
      let attributes = {
        valid : true
      };
      if (res.statusCode == 404) {
          attributes.valid = false;
          attributes.reason = "Not Found/404";
      }
      return attributes;
    },
    hostNames : ["box.com", "app.box.com"]
}