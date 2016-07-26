var async = require('async');
var moment = require('moment');
var RandomColor = require('just.randomcolor');

class StatUtils {
    generateRandomColor() {
        var randomColor = new RandomColor({
            a: [0.9, 1.0]
        });
        return {
            color: randomColor.toRGBA().toCSS(),
            highlight: "rgba(" + randomColor.toRGBA().value.r + "," + randomColor.toRGBA().value.g + "," + randomColor.toRGBA().value.b + ",0.6)"
        };
    }
    async generateChartLabels() {
        return new Promise((resolve) => {
            let today = moment();
            let todaysDate = today.date();
            let labels = [];
            for (var i = 1; i <= todaysDate + 1; i++) {
                let day = moment(today);
                day.date(i);
                labels.push(day.format('MMM D'));

                if (i === todaysDate + 1) {
                    resolve(labels);
                }
            }
        });
    }
    async generateData(allArticles, label) {
        return new Promise((resolve) => {
            let sourceData = {};
            let today = moment();
            let articlesOnDays = new Array(today.date() + 1).fill(0);
            async.each(allArticles, (article, done) => {
                var articleCreatedDay = moment(article.createdAt);
                if (articleCreatedDay.month() === today.month()) {
                    articlesOnDays[articleCreatedDay.date() - 1]++;
                }

                if (sourceData.hasOwnProperty(article.longPublication)) {
                    sourceData[article.longPublication].value++;
                } else {
                    var colors = this.generateRandomColor();
                    sourceData[article.longPublication] = {
                        color: colors.color,
                        highlight: colors.highlight,
                        label: article.shortPublication,
                        long: article.longPublication,
                        value: 1
                    };
                }

                done();
            }, async () => {
                var sourcePie = Object.values(sourceData);
                var labels = await this.generateChartLabels();
                var datasets = [
                    {
                        label,
                        fillColor: "rgba(219.75.75,0.3)",
                        pointColor: "rgba(219.75.75.1)",
                        pointHighlightFill: "#FFFFFF",
                        pointHighlightStroke: "rgba(219,75,75,1)",
                        pointStrokeColor: "#FFFFFF",
                        data: articlesOnDays
                    }
                ];
                resolve({
                    pie: sourcePie,
                    line: {
                        labels,
                        datasets
                    }
                });
            });
        });
    }
    async generateUserStats(users, email) {
        return new Promise((resolve) => {
            var userData = {};
            async.each(users, (user, done) => {
                if (user.email === email) {
                    userData = user;
                }
                done();
            }, () => {
                resolve(userData);
            });
        });
    }
}

module.exports = StatUtils;
