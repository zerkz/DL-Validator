let links = [
{ 
  link : "http://www.mediafire.com/download/o1y93ool22t83sg/Embrace_All-You-Good-Good-People_v1_p.psarc"
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