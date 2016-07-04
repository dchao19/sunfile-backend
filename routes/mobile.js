var express = require('express');
var router = express.Router();

router.get('/featured_sources', function(req, res) {
    res.json({
        message: "success",
        international: {
            label: "International Sources",
            sources: [
                {
                    title: "The World Politics Review",
                    tags: ["international", "bipartisan", "long"],
                    detail: "Uncomprising analysis of critical global trends and international policy.",
                    short: "WPR",
                    feedUrl: "http://feeds.feedburner.com/worldpoliticsreview"
                },
                {
                    title: "Foreign Policy Magazine",
                    tags: ["international", "indepth"],
                    detail: "Magazine of global politics, economics and ideas",
                    short: "FP",
                    feedUrl: "http://foreignpolicy.com/feed"
                },
                {
                    title: "Wall Street Journal - World",
                    tags: ["fast", "easyread", "global"],
                    detail: "Top stories, photos, videos, detailed analysis and in-depth coverage",
                    short: "WSJ",
                    feedUrl: "http://online.wsj.com/xml/rss/3_7085.xml"
                },
                {
                    title: "The Diplomat",
                    tags: ["asia-pacific", "complex", "long"],
                    detail: "Read The Diplomat. Know the Asia-Pacific",
                    short: "Dpl",
                    feedUrl: "http://thediplomat.com/feed/atom/"
                },
                {
                    title: "DipNote",
                    tags: ["official", "usstate", "international"],
                    detail: "The United States Secretary of State Official Blog",
                    short: "Dpn",
                    feedUrl: "http://feeds.feedburner.com/dipnote"
                },
                {
                    title: "The Council on Foreign Relations",
                    tags: ["official", "international"],
                    detail: "Think tank specializing in U.S. foreign policy and international affairs.",
                    short: "CFR",
                    feedUrl: "http://feeds.cfr.org/cfr_main"
                }
            ]
        },
        domestic: {
            label: "Domestic Sources",
            sources: [

            ]
        },
        wires: {

        },
        think: {

        }
    });
});

module.exports = router;
