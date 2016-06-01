let links = [
{
  link : "https://goo.gl/2idTtW"
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
