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
            let sourcesNum = {};

            let today = moment();
            let articlesOnDays = new Array(today.date() + 1).fill(0);
            async.each(allArticles, (article, done) => {
                var articleCreatedDay = moment(article.createdAt);
                if (articleCreatedDay.month() === today.month()) {
                    articlesOnDays[articleCreatedDay.date() - 1]++;
                }

                if (sourcesNum.hasOwnProperty(article.longPublication)) {
                    sourcesNum[article.longPublication].value++;
                    done();
                } else {
                    var colors = this.generateRandomColor();

                    sourcesNum[article.longPublication] = {
                        value: 1,
                        label: article.shortPublication,
                        color: colors.color,
                        highlight: colors.highlight
                    };

                    done();
                }
            }, async () => {
                let sourcesNumArray = Object.values(sourcesNum);
                sourcesNumArray.sort((a, b) => {
                    return b.value - a.value;
                });

                let top = sourcesNumArray.slice(0, 15);
                let bottom = sourcesNumArray.slice(15);

                if (typeof bottom[0] !== 'undefined') {
                    let bottomSum = bottom.reduce(((total, elem) => total + elem.value), 0);
                    console.log(bottomSum);
                    top.push({
                        value: bottomSum,
                        label: 'Other',
                        color: bottom[0].color,
                        highlight: bottom[0].highlight
                    });
                }

                let values = top.map((a) => a.value);
                let colors = top.map((a) => a.color);
                let labels = top.map((a) => a.label);
                let highlight = top.map((a) => a.highlight);

                let sourcePie = {
                    labels,
                    datasets: [
                        {
                            label: "My Sources",
                            data: values,
                            backgroundColor: colors,
                            hoverBackgroundColor: highlight
                        }
                    ]
                };
                let articleLabels = await this.generateChartLabels();

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
                        labels: articleLabels,
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
