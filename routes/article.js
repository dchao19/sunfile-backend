var express = require('express');
var apiKeys = require('../utils/apiKeys');
var apiHelpers = require('../utils/apiHelpers');
var apiUrls = require('../utils/apiUrls');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

var Article = require('../models/Article');
var Team = require('../models/Team');
var Utils = require('../utils/utils');
var utils = new Utils();

router.use(passport.authenticate('bearer', {
    session: false,
    failureRedirect: '/api/auth/loudfailure'
}));

router.post('/content', function(req, res) {
    req.accepts('html'); // The easiest way to not break the formatting of JSON is by directly POSTing the HTML content of page. Potentially insecure.

    if (req.body) { // Confirm HTML data was sent in the request
        require("jsdom").env("", function(err, window) {
            var $ = require("jquery")(window);
            var preStrip = $('<div/>').html(req.body);
            var htmlData = preStrip.find('.last-update,.fyre,style,script,.layout-detail-page__footer,.teaser__byline').remove().end().html();
            apiHelpers.watsonRequestFactory(apiUrls.COMBINED, // Generate combined call to Watson to gather metadaat about article
                {
                    apikey: apiKeys.alchemy,
                    html: htmlData,
                    extract: "pub-date, keywords", // We want to extract authors, the publication date, keywords, and the title
                    outputMode: "json"
                },
                function(metadata) {
                    apiHelpers.watsonRequestFactory(apiUrls.TEXT, // The combined call doesn't provide the text extraction - I need to do it again
                        {
                            apikey: apiKeys.alchemy,
                            html: htmlData,
                            outputMode: "json"
                        },
                        async function(content) {
                            if (metadata.error || content.error || !content.body.text) { // If there is an error or no content was returned from the text extraction, error 500 and don't continue
                                res.json(500, {message: "Server error", errMessage: "An unexpected server error has occured."});
                            } else {
                                let publicationDate = await apiHelpers.aylienAsyncData(apiUrls.DATE, {
                                    html: htmlData
                                });
                                let actualPubDate = publicationDate.body.publishDate ? publicationDate.body.publishDate : metadata.body.publicationDate.date;
                                apiHelpers.parseKeywords(metadata.body.keywords, [], 0, function(keywords) { // Node can't do sync loops so we do this method recursively and callback when complete
                                    res.json({
                                        message: "success",
                                        result: {
                                            paragraphs: apiHelpers.parseParagraphs(content.body.text), // The templater expects the paragraphs to be arrays of key/value pairs
                                            title: publicationDate.body.title,
                                            keywords: metadata.body.keywords,
                                            author: publicationDate.body.author,
                                            pubDate: actualPubDate,
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
                sentences_number: 3  // eslint-disable-line
            }, function(content) {
                var summary = content.body.sentences.map(function(sentence) {
                    return {sentence};
                });
                res.json({
                    message: 'success',
                    result: {
                        summary
                    }
                });
            }
        );
    } else {
        res.status(400).json({message: 'Missing data', errMessage: "Either the title or the text field was not sent with the request. These are required parameters."});
    }
});

router.post('/new', async function(req, res) {
    try {
        let fileCodes = await utils.findFileCodes(req.body.url);
        var newArticle = new Article({
            title: req.body.title,
            longPublication: fileCodes.longName,
            shortPublication: fileCodes.shortName,
            user: req.user.email
        });

        let team = await Team.findOne({users: {$elemMatch: {email: req.user.email}}});
        if (!team) {
            return res.json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }
        let duplicateArticle = await utils.checkDuplicate(team.articles, newArticle);

        if (duplicateArticle) {
            return res.status(409).json({
                success: false,
                message: 'already-exists-error',
                errorCode: 900,
                errMessage: "Somebody from your team has already filed this article!"
            });
        }

        team.articles.push(newArticle);
        team.users = team.users.map((user) => {
            if (user.email === newArticle.user) {
                user.numArticles++;
            }
            return user;
        });
        team.save();

        res.json({
            success: true,
            message: 'success',
            result: newArticle
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'server-error',
            errorCode: 0,
            errMessage: 'An internal server error has occured.'
        });
    }
});

router.get('/recents', async (req, res) => {
    try {
        let queryLength = (req.query.length) ? req.query.length : 5;

        let team = await Team.findOne({users: {$elemMatch: {email: req.user.email}}});
        if (!team) {
            return res.json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }

        let result = team.articles.slice(team.articles.length - (queryLength));
        res.send({
            success: true,
            message: 'success',
            result
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'server-error',
            errorCode: 0,
            errMessage: 'An internal server error has occured.'
        });
    }
});

module.exports = router;
