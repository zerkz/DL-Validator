let URL = require('url');

//general util module. 
//TODO: Abstract methods out whenever a suitable amount clutter up this module.

module.exports = {
  isContentDispositionValid : function (res) {
    let contentDisposition = res.headers['content-disposition'];
    return (contentDisposition && (contentDisposition.indexOf('filename') >= 0))
  },

  retrieveRedirect : function (res) {
    let referrer = res.request.uri.href;
    let redirect = res.headers && res.headers.location;
    if (redirect) {
      let redirectURL = URL.parse(redirect);
      if (redirect === redirectURL.path) {
        return URL.resolve(referrer, redirectURL.path);
      } else {
        return redirect;
      }
    } else {
      return false;
    }
  }

}