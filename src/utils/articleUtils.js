const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const pruneHtml = htmlData => {
    const { window } = new JSDOM("");

    var $ = require("jquery")(window);
    var preStrip = $("<div/>").html(req.body);
    var htmlData = preStrip
        .find(".last-update,.fyre,style,script,.layout-detail-page__footer,.teaser__byline")
        .remove()
        .end()
        .html();
};

export { pruneHtml };
