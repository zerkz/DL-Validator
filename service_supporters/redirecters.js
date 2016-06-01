//kinda hacky, but such is the way of supporting dynamic redirects...
module.exports = {
  name : "Redirecting/Analytics/URL Shortener Services",
  verifyDownloadExists : function (res) {
    let redirect = res.headers.location;
    let attributes = {
      valid : true
    };
    if (!redirect || res.statusCode === 404) {
      attributes.valid = false;
      attributes.reason = "Expected redirect, found none/404.";
    } else {
      attributes.valid = true;
      attributes.redirectedURL = redirect;
    }

    return attributes;
  },
  //goo.gl gives the finger to some proxy servers. beware.
  hostNames : ["goo.gl", "www.goog.gl", "bit.ly", "www.bit.ly"],
}
