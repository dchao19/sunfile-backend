import mongoose from "mongoose";

var connectionString = "127.0.0.1:27017/sunfile-beta";
let options = {};

if (process.env.NODE_ENV === "test") {
    connectionString = "mongodb://localhost:27017/sunfile-test";
} else if (process.env.NODE_ENV === "development") {
    connectionString = "mongodb://localhost:27017/sunfile-local";
} else if (process.env.NODE_ENV === "production") {
    connectionString = `mongodb://cluster0-shard-00-00-ffyow.mongodb.net:27017,cluster0-shard-00-01-ffyow.mongodb.net:27017,cluster0-shard-00-02-ffyow.mongodb.net:27017/sunfile?ssl=true&authSource=admin`;
    options = {
        server: { poolSize: 3 },
        replset: { rs_name: "Cluster0-shard-0" }, // eslint-disable-line
        user: process.env.SUNFILE_ATLAS_USERNAME,
        pass: process.env.SUNFILE_ATLAS_PASSWORD
    };
}

mongoose.connect(
    connectionString,
    options,
    function(err) {
        if (err) {
            throw err;
        }
        if (process.env.NODE_ENV !== "test") {
            console.log("Successfully connected to MongoDB");
        }
    }
);
