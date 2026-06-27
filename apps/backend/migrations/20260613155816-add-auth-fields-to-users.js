"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    ALTER TABLE users 
    ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'temproray hashed password',
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE users DROP COLUMN IF EXISTS role;
    ALTER TABLE users DROP COLUMN IF EXISTS password;
  `);
};

exports._meta = {
  version: 1,
};
