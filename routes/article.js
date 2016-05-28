var express = require('express');
var unirest = require('unirest');
var apiKeys = require('../utils/apiKeys')
var router = express.Router();

router.use(function (req, res, next) {
    if(!req.session || !req.session.authenticated) res.json(401, {"message": "Unauthorized!", "errMessage" : "You are not logged in with the correct credientals to preform this action / your cookie could have expired!" });
    else next();
})

router.post('/article_content', function (req, res) {
    if(!req.body.htmlContent) res.json(400, { "message": "Missing data", "errMessage": "The htmlContent data is empty."});
    else {
        var req = unirest("POST", "http://gateway-a.watsonplatform.net/calls/html/HTMLGetText");

        req.headers({
            "content-type": "application/x-www-form-urlencoded"
        });

        req.form({
            "apikey": apiKeys.alchemy,
            "html": req.body.htmlContent,
            "outputMode": "json"
        });

        req.end(function (res2) {
            if (res2.error) res2.json(500, { "message": "Server error", "errMessage": "An unexpected server error has occured." });
            else {
               res.json({ "message": "success", "result": res2.body.text})
            }  
        });
    }
});

module.exports = router;