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
    ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(64) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ DEFAULT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE users
    DROP COLUMN IF EXISTS reset_password_token,
    DROP COLUMN IF EXISTS reset_password_expires;
  `);
};

exports._meta = {
  version: 1,
};
