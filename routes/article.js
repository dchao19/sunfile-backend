var express = require('express');
var apiKeys = require('../utils/apiKeys');
var apiHelpers = require('../utils/apiHelpers');
var apiUrls = require('../utils/apiUrls');
var router = express.Router();

// router.use(function(req, res, next) {
//     if (!req.session || !req.session.authenticated) {
//         res.json(401, {message: "Unauthorized!", errMessage: "You are not logged in with the correct credientals to preform this action / your cookie could have expired!"});
//     } else {
//         next();
//     }
// });

router.post('/content', function(req, res) {
    req.accepts('html'); // The easiest way to not break the formatting of JSON is by directly POSTing the HTML content of page. Potentially insecure.

    if (req.body) { // Confirm HTML data was sent in the request
        require("jsdom").env("", function(err, window) {
            var $ = require("jquery")(window);
            var preStrip = $('<div/>').html(req.body);
            var htmlData = preStrip.find('.last-update').remove().end().find('.fyre').remove().end().find('style,script').remove().end().html();
            apiHelpers.watsonRequestFactory(apiUrls.COMBINED, // Generate combined call to Watson to gather metadaat about article
                {
                    apikey: apiKeys.alchemy,
                    html: htmlData,
                    extract: "authors,pub-date,keywords,title", // We want to extract authors, the publication date, keywords, and the title
                    outputMode: "json"
                },
                function(metadata) {
                    apiHelpers.watsonRequestFactory(apiUrls.TEXT, // The combined call doesn't provide the text extraction - I need to do it again
                        {
                            apikey: apiKeys.alchemy,
                            html: htmlData,
                            outputMode: "json"
                        },
                        function(content) {
                            if (metadata.error || content.error || !content.body.text) { // If there is an error or no content was returned from the text extraction, error 500 and don't continue
                                res.json(500, {message: "Server error", errMessage: "An unexpected server error has occured."});
                            } else {
                                apiHelpers.parseKeywords(metadata.body.keywords, [], 0, function(keywords) { // Node can't do sync loops so we do this method recursively and callback when complete
                                    res.json({
                                        message: "success",
                                        result: {
                                            paragraphs: apiHelpers.parseParagraphs(content.body.text), // The templater expects the paragraphs to be arrays of key/value pairs
                                            title: metadata.body.title,
                                            keywords: keywords,
                                            author: metadata.body.authors.names[0],
                                            pubDate: metadata.body.publicationDate.date,
                                            text: content.body.text
                                        }
                                    });
                                });
                            }
                        }
                    );
                }
            );
        });
    } else {
        res.json(400, {message: "Missing data", errMessage: "No data was received from the request."}); // This endpoint cannot proceed without html content from the request
    }
});

router.post('/summary', function(req, res) {
    if (req.body.title && req.body.text) {
        apiHelpers.aylienRequestFactory(apiUrls.SUMMARY,
            {
                title: req.body.title,
                text: req.body.text,
                sentences_number: 3
            }, function(content) {
                var summary = content.body.sentences.map(function(sentence) {
                    return {sentence: sentence};
                });
                res.json({
                    message: 'success',
                    result: {
                        summary: summary
                    }
                });
            }
        );
    } else {
        res.status(400).json({message: 'Missing data', errMessage: "Either the title or the text field was not sent with the request. These are required parameters."});
    }
});

module.exports = router;

