//returns a collection of download links from a mongodb.

let moongoose = require('mongoose');
let config = require('../local_config.json') || require('../config.json');

let dbConfig = config.input_processors.db || {};
const dbUrl = dbConfig.url;

module.exports = {
    commandAlias : "mongo"
    function checkCommandArgs(mongoUrl, mongoCollectionName, query) {

    }
};