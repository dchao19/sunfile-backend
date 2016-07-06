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
                {
                    title: "Washington Post - National",
                    tags: ["liberal", "domestic policy"],
                    detail: "Breaking news and analysis on politics, business, world national news, entertainment",
                    short: "WP",
                    feedUrl: "http://feeds.washingtonpost.com/rss/national"
                },
                {
                    title: "Politico",
                    tags: ["domestic", "bipartisan", "analysis"],
                    detail: "Political news about campaigns, Congress, lobbyists and issues.",
                    short: "Pol",
                    feedUrl: "http://feeds.politico.com/politico/rss/politicopicks"
                },
                {
                    title: "The Atlantic",
                    tags: ["news", "politics", "culture"],
                    detail: "News and analysis on politics, business, culture, technology, national, international and life",
                    short: "Atl",
                    feedUrl: "http://feeds.feedburner.com/TheAtlantic"
                }
            ]
        },
        wires: {
            label: "Wires and Aggregates",
            sources: [
                {
                    title: "Reuters Wire Service",
                    tags: ["fast", "short"],
                    detail: "The latest news from around the world, covering breaking news in business, politics, entertainment, technology and video.",
                    short: "Rt",
                    feedUrl: "http://feeds.reuters.com/reuters/topNews?irpc=69"
                },
                {
                    title: "BBC",
                    tags: ["fast", "short", "omgthatsomuch"],
                    detail: "Breaking news, sport, TV, radio and a whole lot more",
                    short: "BBC",
                    feedUrl: "http://feeds.bbci.co.uk/news/world/rss.xml"
                }
            ]
        },
        think: {
            label: "Think Tanks",
            sources: [
                {
                    title: "The Carnegie Endowment",
                    tags: ["think tanks", "long", "politics"],
                    detail: "",
                    short: "CE",
                    feedUrl: "http://carnegieendowment.org/rss/solr/?fa=feeds"
                },
                {
                    title: "Chatham House - Expert Comment",
                    tags: ["think tanks", "long", "politics"],
                    detail: "An independent policy institute based in London",
                    short: "CH",
                    feedUrl: "http://feeds.feedburner.com/ChathamHouseExpertComment"
                },
                {
                    title: "The Harvard International Review",
                    tags: ["think tanks", "namedrop", "liberal"],
                    detail: "Quarterly journal and website of international relations published by the Harvard International Relations Council at Harvard University.",
                    short: "HIR",
                    feedUrl: "http://hir.harvard.edu/feed"
                },
                {
                    title: "The Harvard Political Review",
                    tags: ["think tanks", "domestic"],
                    detail: "The preeminent nonpartisan quarterly covering politics, culture, and campus life.",
                    short: "HPR",
                    feedUrl: "http://hpronline.org/feed/"
                },
                {
                    title: "The Hoover Institution",
                    tags: ["think tanks", "liberal", "long"],
                    detail: "A public policy think tank promoting the principles of individual, economic, and political freedom.",
                    short: "HI",
                    feedUrl: "http://www.hoover.org/rss/hoover.xml"
                },
                {
                    title: "The Heritage Foundation",
                    tags: ["think tanks", "economics", "international", "conservative"],
                    detail: "a conservative research think tank based in Washington D.C. Read studies and papers on free enterprise, limited government, individual freedom, traditional American values, and a strong national defense.",
                    short: "HF",
                    feedUrl: "http://www.heritage.org/static/rss/reports.xml"
                }
            ]
        }
    });
});

module.exports = router;
