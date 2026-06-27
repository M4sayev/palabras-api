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
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE categories (
        category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT NOT NULL
    );

    CREATE TABLE words (
        word_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        word VARCHAR(50) NOT NULL
    );

    CREATE TABLE meanings (
        meaning_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        word_id INT REFERENCES words(word_id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
        definition TEXT NOT NULL,
        example_sentence TEXT NOT NULL
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE IF EXISTS meanings CASCADE;
    DROP TABLE IF EXISTS words CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
};

exports._meta = {
  version: 1,
};
