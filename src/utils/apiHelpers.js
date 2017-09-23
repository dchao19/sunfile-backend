var unirest = require("unirest");
var apiKeys = require("./apiKeys");

var apiHelpers = {
    watsonRequestFactory: function(url, data, callback) {
        var request = unirest("POST", url);
        request.headers({
            "content-type": "application/x-www-form-urlencoded"
        });
        request.form(data);
        request.end(callback);
    },
    parseParagraphs: function(text) {
        return text.split("\n").map(function(obj) {
            return { paragraphContent: obj };
        });
    },
    parseKeywords: function(keywords, newKeywords, currentIndex, callback) {
        if (currentIndex === keywords.length - 1) {
            callback(newKeywords);
            return;
        }

        if (keywords[currentIndex].relevance >= 0.9) {
            newKeywords.push(keywords[currentIndex].text);
        }

        this.parseKeywords(keywords, newKeywords, currentIndex + 1, callback);
    },
    aylienRequestFactory: function(url, data, callback) {
        var request = unirest("POST", url);
        request.headers({
            "Content-Type": "application/x-www-form-urlencoded",
            "X-AYLIEN-TextAPI-Application-Key": apiKeys.aylien.key,
            "X-AYLIEN-TextAPI-Application-ID": apiKeys.aylien.appId
        });
        request.form(data);
        request.end(callback);
    },
    aylienAsyncData: function(url, data) {
        return new Promise(resolve => {
            var request = unirest("POST", url);
            request.headers({
                "Content-Type": "application/x-www-form-urlencoded",
                "X-AYLIEN-TextAPI-Application-Key": apiKeys.aylien.key,
                "X-AYLIEN-TextAPI-Application-ID": apiKeys.aylien.appId
            });
            request.form(data);
            request.end(content => {
                resolve(content);
            });
        });
    }
};

module.exports = apiHelpers;
