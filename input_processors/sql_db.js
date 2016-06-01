'use strict';
//returns many download links from a SQL select query.
//supports all DB types supported by sequelize
//each column is put into the attributes for handling in the result handler.

let config = require('../local-config.json') || require('../config.json');
let Sequelize = require("sequelize");
let dbConfig = config.input_processors.sql_db || {};
const sqlHost = dbConfig.host;
const sqlDb = dbConfig.database;
const sqlDialect = dbConfig.dialect;
const sqlQuery = dbConfig.query;
const sqlDownloadLinkColumnName = dbConfig.dl_link_column;
const sqlUser = dbConfig.username;
const sqlPassword = dbConfig.password;


function validate(dbConfig) {
    return true;
}

module.exports = {
  commandAlias : "sql_db",
  getDownloadLinks: function (callback) {
    validate(dbConfig);
    let options = {};
    if (sqlDialect == 'sqlite') {
      options.storage = sqlHost
    } else {
      options.host = sqlHost;
      options.dialect = sqlDialect;
    }
    let sequelize = new Sequelize(sqlDb, sqlUser, sqlPassword, options);
    try {
      sequelize.query(sqlQuery, { type: sequelize.QueryTypes.SELECT} ).then(function (results) {
        return callback(null, sqlDownloadLinkColumnName, results);
      });
    } catch (e) {
      return callback(e.message);
    }

  }
};
