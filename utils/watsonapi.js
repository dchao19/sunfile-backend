var unirest = require('unirest');

var watsonapi = {
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
            return {paragraphContent: obj};
        });
    },
    parseKeywords: function(keywords, newKeywords, currentIndex, callback) {
        if (currentIndex === keywords.length - 1) {
            callback(newKeywords);
            return;
        }

        if (keywords[currentIndex].relevance >= 0.90) {
            newKeywords.push(keywords[currentIndex].text);
        }

        this.parseKeywords(keywords, newKeywords, currentIndex + 1, callback);
    }
};

module.exports = watsonapi;
