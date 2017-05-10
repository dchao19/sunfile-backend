﻿var connectionString = '127.0.0.1:27017/sunfile-beta';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.SUNFILE_DB_PASSWORD && !process.env.IS_KENT) {
    connectionString = process.env.SUNFILE_DB_USERNAME + ":" + process.env.SUNFILE_DB_PASSWORD + "@" +
    'mongo.danielchao.me:27017/sunfile-beta';
} else if (process.env.IS_KENT) {
    connectionString = process.env.SUNFILE_DB_USERNAME + ":" + process.env.SUNFILE_DB_PASSWORD + "@" +
    'localhost:27017/sunfile-beta';
}

module.exports = {
    url: connectionString
};
