let links = [
{ 
  link : "https://fs12n5.sendspace.com/dl/c3008f0ed3d8ae20a5f9c0812f8b972e/56d85e2d2d644877/k9vxz6/Green-Day_The-Static-Age_v1_p.psarc"
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