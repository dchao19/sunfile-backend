require("babel-polyfill");
require("dotenv").config();

var express = require("express");
var logger = require("morgan");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var cors = require("cors");

var indexRoutes = require("./routes/index.js");
var apiRoutes = require("./routes/api.js");
var articleRoutes = require("./routes/article");
var mobileRoutes = require("./routes/mobile");
var authRoutes = require("./routes/auth");
var sourceRoutes = require("./routes/sources");
var teamRoutes = require("./routes/teams");
var infoRoutes = require("./routes/info");

require("./config/passportConfig");
require("./config/dbConfig.js");

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

if (process.env.NODE_ENV === "heroku-staging") {
    port = process.env.PORT;
    ipaddress = "0.0.0.0";
}

mongoose.Promise = global.Promise;

var app = express();
app.set("view engine", "pug");
if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
}

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.text({ type: "html", limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "views")));
app.use(passport.initialize());
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST"]
    })
);

app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/info", infoRoutes);
app.use("/api/mobile", mobileRoutes);
app.use("/api/article", articleRoutes);

app.listen(port, ipaddress, () => {
    if (process.env.NODE_ENV !== "test") {
        console.log("Express server listening on " + ipaddress + ":" + port);
    }
});

module.exports = app;
