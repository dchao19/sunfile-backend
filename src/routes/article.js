var express = require("express");
var apiKeys = require("../utils/apiKeys");
var apiHelpers = require("../utils/apiHelpers");
var apiUrls = require("../utils/apiUrls");
var passport = require("passport");
var router = express.Router(); // eslint-disable-line

var Article = require("../models/Article");
var Account = require("../models/Account");
var Team = require("../models/Team");
var Utils = require("../utils/utils");
var URL = require("url").URL;
var utils = new Utils();

import { pruneHtml } from "../utils/articleUtils";

router.use(
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/api/auth/loudfailure"
    })
);

router.post("/content", async function(req, res) {
    req.accepts("html"); // The easiest way to not break the formatting of JSON is by directly POSTing the HTML content of page. Potentially insecure.

    if (!req.body) {
        return res.json(400, {
            message: "Missing data",
            errMessage: "No data was received from the request."
        }); // This endpoint cannot proceed without html content from the request
    }

    const pruned = pruneHtml(req.body);
    const extractionData = (await apiHelpers.aylienAsyncData(apiUrls.AYLIEN_EXTRACTION, {
        html: pruned
    })).body;

    const paragraphs = apiHelpers.parseParagraphs(extractionData.article);

    res.json({
        message: "success",
        result: {
            paragraphs, // The templater expects the paragraphs to be arrays of key/value pairs
            title: extractionData.title,
            keywords: [],
            author: extractionData.author,
            pubDate: extractionData.publishDate,
            text: extractionData.article
        }
    });
});

router.post("/summary", function(req, res) {
    if (req.body.title && req.body.text) {
        apiHelpers.aylienRequestFactory(
            apiUrls.SUMMARY,
            {
                title: req.body.title,
                text: req.body.text,
                sentences_number: 3 // eslint-disable-line
            },
            function(content) {
                var summary = content.body.sentences.map(function(sentence) {
                    return { sentence };
                });
                res.json({
                    message: "success",
                    result: {
                        summary
                    }
                });
            }
        );
    } else {
        res.status(400).json({
            message: "Missing data",
            errMessage:
                "Either the title or the text field was not sent with the request. These are required parameters."
        });
    }
});

router.post("/new", async function(req, res) {
    try {
        if (!req.body.url) {
            return res.status(400).json({
                success: false,
                message: "missing-data-error",
                errorCode: 4,
                errMessage:
                    "The url property was not specified with the request. This is a required parameter"
            });
        }
        if (!req.body.title) {
            return res.status(400).json({
                success: false,
                message: "missing-data-error",
                errorCode: 4,
                errMessage:
                    "The title property was not specified with the request. This is a required parameter"
            });
        }

        let team = await Team.findOne({ teamCode: req.user.teamCode });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "not-found-error",
                errorCode: 3,
                errMessage: "The user's team could not be found"
            });
        }

        let user = await Account.findOne({ userID: req.user.userID });

        let fileCodes = await utils.findFileCodes(req.body.url);
        let shortPublication =
            !fileCodes || !fileCodes.shortName
                ? new URL(req.body.url).hostname
                : fileCodes.shortName;

        let longPublication =
            !fileCodes || !fileCodes.longName ? new URL(req.body.url).hostname : fileCodes.longName;

        var newArticle = new Article({
            title: req.body.title,
            longPublication,
            shortPublication,
            user: req.user.email,
            teamCode: req.user.teamCode
        });

        let duplicateArticle = await Article.findOne({
            title: newArticle.title,
            teamCode: team.teamCode
        });

        if (duplicateArticle) {
            return res.status(409).json({
                success: false,
                message: "already-exists-error",
                errorCode: 900,
                errMessage: "Somebody from your team has already filed this article!"
            });
        }

        console.log(`Article ID: ${newArticle._id}`);

        team.articles.push(newArticle._id);
        user.articles.push(newArticle._id);

        await Promise.all([user.save(), team.save(), newArticle.save()]);

        res.json({
            success: true,
            message: "success",
            result: newArticle
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "server-error",
            errorCode: 0,
            errMessage: "An internal server error has occured."
        });
    }
});

router.get("/recents", async (req, res) => {
    try {
        let queryLength = req.query.length ? req.query.length : 5;
        let articles = await Article.find({ user: req.user.email })
            .sort({ createdAt: -1 })
            .limit(5);

        res.send({
            success: true,
            message: "success",
            result: articles
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "server-error",
            errorCode: 0,
            errMessage: "An internal server error has occured."
        });
    }
});

router.delete("/delete", async (req, res) => {
    try {
        if (!req.query._id) {
            return res.status(400).json({
                success: false,
                message: "missing-data-error",
                errorCode: 4,
                errMessage:
                    "The _id property was not specified with the request. This is a required parameter"
            });
        }

        let user = await Account.findOne({ userID: req.user.userID });
        let team = await Team.findOne({ teamCode: req.user.teamCode });
        let article = await Article.findByIdAndRemove(req.query._id);
        if (article) {
            user.articles = user.articles.filter(id => id.toString() !== req.query._id);
            team.articles = team.articles.filter(id => id.toString() !== req.query._id);

            await user.save();
            await team.save();

            return res.json({
                success: true,
                message: "deleted"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "article-not-found",
                errorCode: 5,
                errMessage: "The article to be deleted could not be found."
            });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "server-error",
            errorCode: 0,
            errMessage: "An internal server error has occured."
        });
    }
});

module.exports = router;
