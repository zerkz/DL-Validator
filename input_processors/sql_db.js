//returns many download links from a SQL select query.
//supports all DB types supported by sequelize
//each column is put into the attributes for handling in the result handler.

let config = require('../local_config.json') || require('../config.json');
let sequelize = require('sequelize');

let dbConfig = config.input_processors.db || {};
const sqlUrl = dbConfig.uri;
const sqlDb = dbConfig.database;
const sqlDialect = dbConfig.dialect;
const sqlQuery = dbConfig.query;
const sqlDownloadLinkColumnName = dbConfig.dl_link_column;
const sqlUser = dbConfig.username;
const sqlPassword = dbConfig.password;

module.exports = {
  commandAlias : "sql_db",
  function getDownloadLinks(callback) {
    validate(dbConfig);
    let options = {};
    if (sqlDialect == 'sqlite') {
      options.storage = sqlUrl
    } else {
      options.host = sqlUrl;
      options.dialect = sqlDialect;
    }
    let sequelize = new Sequelize(sqlDb, sqlUser, sqlPassword, options);
    try {
      sequelize.query(sqlQuery).then(function (results) {
        let dlLinks = results[sqlDownloadLinkColumnName];
        delete results[sqlDownloadLinkColumnName];
        return callback(null, dlLinks, results);
      });
    } catch (e) {
      return callback(e.message);
    }
    
  }
};