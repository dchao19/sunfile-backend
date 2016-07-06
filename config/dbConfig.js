var connectionString = '127.0.0.1:27017/sunfile';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.SUNFILE_DB_PASSWORD) {
    connectionString = process.env.SUNFILE_DB_USERNAME + ":" + process.env.SUNFILE_DB_PASSWORD + "@" +
    'mongo.danielchao.me:27017/sunfile';
}

module.exports = {
    url: connectionString
};
