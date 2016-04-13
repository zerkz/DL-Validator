let links = [
{ 
  link : "http://www.bit.ly/1bfA9gb]"
}
];

module.exports = {
  commandAlias : "simple",
  getDownloadLinks : getDownloadLinks,
  links : links
};

function getDownloadLinks(callback) {
    return callback(null, "link", links);
}