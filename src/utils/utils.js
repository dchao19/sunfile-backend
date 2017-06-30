var Team = require('../models/Team');
var Source = require('../models/Source');
var async = require('async');
var unirest = require('unirest');
var apiUrls = require('../utils/apiUrls');
var apiKeys = require('../utils/apiKeys');

class utils {
    generateRandomTeamCode() {
        var selectables = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var teamCode = "";
        for (var i = 0; i < 6; i++) {
            teamCode += selectables.charAt(Math.floor(Math.random() * 35));
        }
        return teamCode;
    }
    whileNotUnique(teamCode) {
        return new Promise(async (resolve, reject) => {
            let team = await Team.findOne({id: teamCode});
            if (team) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    }
    async generateAndVerifyTeamCode() {
        return new Promise(async (resolve) => {
            let unique = false;
            while (!unique) {
                let teamCode = this.generateRandomTeamCode();
                unique = this.whileNotUnique(teamCode)
                .then((result) => {
                    return result;
                })
                .then(() => {
                    resolve(teamCode);
                })
                .catch((result) => {
                    return result;
                });
            }
        });
    }
    async updateUserTeamCode(userID, teamCode) {
        return new Promise(async (resolve, reject) => {
            unirest.patch(apiUrls.USER + "/" + userID)
            .headers({
                'Authorization': 'Bearer ' + apiKeys.authUserUpdate,
                'Content-Type': 'application/json'
            })
            .type('json')
            .send({
                user_metadata: { // eslint-disable-line
                    teamCode
                }
            })
            .end((response) => {
                if (response.code === 200) {
                    console.log(response.body);
                    resolve(response.body);
                } else {
                    console.log(response.body);
                    reject(response.body);
                }
            });
        });
    }
    async incrementNumArticles(users, email) {
        return new Promise((resolve) => {
            let newUsers = users;
            async.eachOf(newUsers, (user, index, done) => {
                if (user.email === email) {
                    newUsers[index].numArticles++;
                }
                done();
            }, () => {
                resolve(newUsers);
            });
        });
    }
    findFileCodes(url) {
        return new Promise(async (resolve) => {
            let sources = await Source.find({});
            let foundSource = {};
            async.each(sources, (source, done) => {
                if (url.includes(source.host)) {
                    foundSource = source;
                }
                done();
            }, () => {
                resolve(foundSource);
            });
        });
    }
    checkDuplicate(articles, articleToCheck) {
        return new Promise((resolve) => {
            let found = false;
            async.each(articles, (article, done) => {
                if (article.longPublication === articleToCheck.longPublication &&
                    article.title === articleToCheck.title) {
                    found = true;
                }
                done();
            }, () => {
                resolve(found);
            });
        });
    }
}

module.exports = utils;
