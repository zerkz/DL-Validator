let links = [
{ 
  link : "https://copy.com/pY7Fv6OwadasdsadcjIG7mSl?download=1"
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