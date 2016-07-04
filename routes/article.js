var express = require('express');
var apiKeys = require('../utils/apiKeys');
var watsonApi = require('../utils/watsonapi');
var router = express.Router();

router.use(function(req, res, next) {
    if (!req.session || !req.session.authenticated) {
        res.json(401, {message: "Unauthorized!", errMessage: "You are not logged in with the correct credientals to preform this action / your cookie could have expired!"});
    } else {
        next();
    }
});

router.post('/content', function(req, res) {
    req.accepts('html'); // The easiest way to not break the formatting of JSON is by directly POSTing the HTML content of page. Potentially insecure.

    if (req.body) { // Confirm HTML data was sent in the request
        watsonApi.watsonRequestFactory("https://gateway-a.watsonplatform.net/calls/html/HTMLGetCombinedData", // Generate combined call to Watson to gather metadaat about article
            {
                apikey: apiKeys.alchemy,
                html: req.body,
                extract: "authors,pub-date,keywords,title", // We want to extract authors, the publication date, keywords, and the title
                outputMode: "json"
            },
            function(metadata) {
                watsonApi.watsonRequestFactory("https://gateway-a.watsonplatform.net/calls/html/HTMLGetText", // The combined call doesn't provide the text extraction - I need to do it again
                    {
                        apikey: apiKeys.alchemy,
                        html: req.body,
                        outputMode: "json"
                    },
                    function(content) {
                        if (metadata.error || content.error || !content.body.text) { // If there is an error or no content was returned from the text extraction, error 500 and don't continue
                            res.json(500, {message: "Server error", errMessage: "An unexpected server error has occured."});
                        } else {
                            watsonApi.parseKeywords(metadata.body.keywords, [], 0, function(keywords) { // Node can't do sync loops so we do this method recursively and callback when complete
                                res.json({
                                    message: "success",
                                    result: {
                                        paragraphs: watsonApi.parseParagraphs(content.body.text), // The templater expects the paragraphs to be arrays of key/value pairs
                                        title: metadata.body.title,
                                        keywords: keywords,
                                        author: metadata.body.authors.names[0],
                                        pubDate: metadata.body.publicationDate.date
                                    }
                                });
                            });
                        }
                    }
                );
            }
        );
    } else {
        res.json(400, {message: "Missing data", errMessage: "No data was received from the request."}); // This endpoint cannot proceed without html content from the request
    }
});

module.exports = router;

