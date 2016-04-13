//general util module. 
//TODO: Abstract methods out whenever a suitable amount clutter up this module.

module.exports = {
  isContentDispositionValid : function (res) {
    let contentDisposition = res.headers['content-disposition'];
    return (contentDisposition && (contentDisposition.indexOf('filename') >= 0))
  },

}