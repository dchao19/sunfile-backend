import "babel-polyfill";
require("dotenv").config({ path: "../../.env" });
import should from "should";
import Team from "../models/Team";
import Account from "../models/Account";
import request from "supertest";
import app from "../server.js";
import { expect } from "chai";

import { idToken } from "./testConfig";
import * as testData from "./testData";
import "./preTest";

console.log(idToken);

/* eslint no-unused-expressions: 0 */

describe("Tests on /", () => {
    it("should have a 200 status", done => {
        request(app)
            .get("/")
            .expect(200)
            .end(err => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});

describe("Tests on /teams", () => {
    describe("Index", () => {
        it("should not respond to index", done => {
            request(app)
                .get("/teams")
                .expect(404)
                .end(err => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
    describe("Creating a new team", () => {
        it("should require authorization", done => {
            request(app)
                .post("/api/teams/new")
                .expect(302)
                .expect("Location", "/api/auth/loudfailure")
                .end(err => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        describe("Failures", () => {
            beforeEach(() => {
                return new Promise(async resolve => {
                    await Team.create(testData.alreadyExistingTeam);
                    resolve();
                });
            });
            afterEach(() => {
                return new Promise(async resolve => {
                    let team = await Team.findOne({
                        schoolName: testData.alreadyExistingTeam.schoolName
                    });
                    await Team.findByIdAndRemove(team._id);
                    resolve();
                });
            });

            it("should respond with an error if not all data is provided", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .expect(400)
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it("should respond with an error if a team already exists", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        schoolName: "already-exists",
                        contactEmail: testData.alreadyExistingTeam.contactEmail
                    })
                    .expect(409)
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
        });

        describe("Successes", () => {
            afterEach(() => {
                return new Promise(async resolve => {
                    let team = await Team.findOne({ schoolName: testData.newSchoolName });
                    await Team.findByIdAndRemove(team._id);

                    let account = await Account.findOne({ userID: testData.userID });
                    account.teamCode = "";
                    await account.save();
                    resolve();
                });
            });

            it("should create a team with a schoolName", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        schoolName: testData.newSchoolName,
                        contactEmail: testData.newContactEmail
                    })
                    .expect(200)
                    .end((err, body) => {
                        if (err) {
                            return done(err);
                        }

                        expect(body.body.success).to.be.true;
                        expect(body.body.result.schoolName).to.exist;
                        done();
                    });
            });

            it("should create a team with a contactEmail", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        schoolName: testData.newSchoolName,
                        contactEmail: testData.newContactEmail
                    })
                    .expect(200)
                    .end((err, body) => {
                        if (err) {
                            return done(err);
                        }

                        expect(body.body.success).to.be.true;
                        expect(body.body.result.contactEmail).to.exist;
                        done();
                    });
            });

            it("should create a team with a user ID", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        schoolName: testData.newSchoolName,
                        contactEmail: testData.newContactEmail
                    })
                    .expect(200)
                    .end((err, body) => {
                        if (err) {
                            return done(err);
                        }

                        expect(body.body.success).to.be.true;
                        expect(body.body.result.users.length).to.be.greaterThan(0);
                        done();
                    });
            });

            it("should update ther user's team code", done => {
                request(app)
                    .post("/api/teams/new")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        schoolName: testData.newSchoolName,
                        contactEmail: testData.newContactEmail
                    })
                    .expect(200)
                    .end(async err => {
                        if (err) {
                            return done(err);
                        }

                        let user = await Account.findOne({ userID: testData.userID });
                        expect(user.teamCode).to.exist;
                        done();
                    });
            });
        });
    });
    describe("Joining an existing team", () => {
        it("should require authorization", done => {
            request(app)
                .post("/api/teams/new")
                .expect(302)
                .expect("Location", "/api/auth/loudfailure")
                .end(err => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        describe("Failures", () => {
            it("should respond with an error if not all data is provided", done => {
                request(app)
                    .post("/api/teams/join")
                    .set("Authorization", `Bearer ${idToken}`)
                    .expect(400)
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
            it("should respond with an error when provided a team that does not exist", done => {
                request(app)
                    .post("/api/teams/join")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({
                        teamCode: "NONEXISTENT"
                    })
                    .expect(404)
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
        });
        describe("Successes", () => {
            beforeEach(() => {
                return new Promise(async resolve => {
                    await Team.create({
                        schoolName: testData.existingSchoolName,
                        contactEmail: testData.existingContactEmail,
                        teamCode: testData.existingTeamCode
                    });
                    resolve();
                });
            });

            afterEach(() => {
                return new Promise(async resolve => {
                    let team = await Team.findOne({ schoolName: testData.existingSchoolName });
                    await Team.findByIdAndRemove(team._id);

                    let account = await Account.findOne({ userID: testData.userID });
                    account.teamCode = "";
                    await account.save();

                    resolve();
                });
            });

            it("should update the user's team code", done => {
                request(app)
                    .post("/api/teams/join")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({ teamCode: testData.existingTeamCode })
                    .expect(200)
                    .end(async err => {
                        if (err) {
                            return done(err);
                        }

                        let user = await Account.findOne({ userID: testData.userID });
                        expect(user.teamCode).to.exist.and.to.equal(testData.existingTeamCode);
                        done();
                    });
            });

            it("should add a user ID to the team's document", done => {
                request(app)
                    .post("/api/teams/join")
                    .set("Authorization", `Bearer ${idToken}`)
                    .send({ teamCode: testData.existingTeamCode })
                    .expect(200)
                    .end(async err => {
                        if (err) {
                            return done(err);
                        }

                        let user = await Account.findOne({ userID: testData.userID });
                        let team = await Team.findOne({ teamCode: testData.existingTeamCode });
                        expect(team.users).to.contain(user._id);
                        done();
                    });
            });
        });
    });
});

describe("Tests on /info", () => {
    describe("Requesting user info", () => {
        it("should require authorization", () => {
            return new Promise(resolve => {
                request(app)
                    .post("/api/info/user")
                    .expect(302)
                    .expect("Location", "/api/auth/loudfailure")
                    .end(err => {
                        if (err) {
                            return resolve(err);
                        }

                        resolve();
                    });
            });
        });
        describe("Failures", () => {
            it("should respond with an error if the user's team does not exist", () => {
                return new Promise(async (resolve, reject) => {
                    try {
                        let response = await request(app)
                            .get("/api/info/user")
                            .set("Authorization", `Bearer ${idToken}`)
                            .expect(404);

                        expect(response.body.success).to.be.false;
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
        describe("Successes", () => {
            beforeEach(
                () =>
                    new Promise(async resolve => {
                        let account = await Account.findOne({ userID: testData.userID });
                        account.teamCode = "ABCDEF";
                        await account.save();

                        await Team.create({
                            schoolName: testData.newSchoolName,
                            contactEmail: testData.newContactEmail,
                            teamCode: "ABCDEF",
                            users: [account._id]
                        });
                        resolve();
                    })
            );
            afterEach(
                () =>
                    new Promise(async resolve => {
                        let newTeam = await Team.findOne({ schoolName: testData.newSchoolName });
                        let account = await Account.findOne({ userID: testData.userID });

                        account.teamCode = "";
                        await newTeam.remove();
                        await account.save();
                        resolve();
                    })
            );
            it("should respond with user information", () =>
                new Promise(async (resolve, reject) => {
                    try {
                        let response = await request(app)
                            .get("/api/info/user")
                            .set("Authorization", `Bearer ${idToken}`);

                        expect(response.status).to.eq(200);
                        expect(response.body.success).to.be.true;
                        expect(response.body.result.user).to.exist;
                        expect(response.body.result.user.userID).to.eq(testData.userID);

                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }));
            it("should respond with team information", () =>
                new Promise(async (resolve, reject) => {
                    try {
                        let response = await request(app)
                            .get("/api/info/user")
                            .set("Authorization", `Bearer ${idToken}`);

                        expect(response.status).to.eq(200);
                        expect(response.body.success).to.be.true;
                        expect(response.body.result.team).to.exist;
                        expect(response.body.result.team.schoolName).to.eq(testData.newSchoolName);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }));
        });
    });
});
