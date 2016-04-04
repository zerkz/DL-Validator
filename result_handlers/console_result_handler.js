function handleResult (attributes) {
    return function (isDownloadValid) {
        if (isDownloadValid) {
            console.log("Download Valid. URL:" + attributes.url);
        } else {
            console.log("Download Link Invalid. URL:" + attributes.url);
        }
     };
}

function handleError (err) {
    console.error(err);
}

function handleNoServiceSupport(hostname) {
    handleError("No service support for " + hostname);
}

module.exports = {
    handleResult : handleResult,
    handleError : handleError
}