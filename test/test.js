import 'babel-polyfill';
import should from 'should';
import Team from '../models/Team';
import Account from '../models/Account';
import request from 'supertest';
import app from '../server.js';
import {expect} from 'chai';

import {idToken} from './testConfig';
import * as testData from './testData';

console.log(idToken);

/* eslint no-unused-expressions: 0 */

describe('Tests on /', () => {
    it('should have a 200 status', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});

describe('Tests on /teams', () => {
    describe('Index', () => {
        it('should not respond to index', (done) => {
            request(app)
                .get('/teams')
                .expect(404)
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
    describe('Creating a new team', () => {
        it('should require authorization', (done) => {
            request(app)
                .post('/api/teams/new')
                .expect(302)
                .expect('Location', '/api/auth/loudfailure')
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        describe('Failures', () => {
            beforeEach(() => {
                return new Promise(async (resolve) => {
                    await Team.create(testData.alreadyExistingTeam);
                    resolve();
                });
            });
            afterEach(() => {
                return new Promise(async (resolve) => {
                    let team = await Team.findOne({schoolName: testData.alreadyExistingTeam.schoolName});
                    await Team.findByIdAndRemove(team._id);
                    resolve();
                });
            });

            it('should respond with an error if not all data is provided', (done) => {
                request(app)
                    .post('/api/teams/new')
                    .set('Authorization', `Bearer ${idToken}`)
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });

            it('should respond with an error if a team already exists', (done) => {
                request(app)
                    .post('/api/teams/new')
                    .set('Authorization', `Bearer ${idToken}`)
                    .send({
                        schoolName: 'already-exists',
                        contactEmail: testData.alreadyExistingTeam.contactEmail
                    })
                    .expect(409)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
        });

        describe('Successes', () => {
            afterEach(() => {
                return new Promise(async (resolve) => {
                    let team = await Team.findOne({schoolName: testData.newSchoolName});
                    await Team.findByIdAndRemove(team._id);
                    resolve();
                });
            });

            it('should create a team with a schoolName', (done) => {
                request(app)
                    .post('/api/teams/new')
                    .set('Authorization', `Bearer ${idToken}`)
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

            it('should create a team with a contactEmail', (done) => {
                request(app)
                    .post('/api/teams/new')
                    .set('Authorization', `Bearer ${idToken}`)
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

            it('should create a team with a user ID', (done) => {
                request(app)
                    .post('/api/teams/new')
                    .set('Authorization', `Bearer ${idToken}`)
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
        });
    });
    describe('Joining an existing team', () => {
        it('should require authorization', (done) => {
            request(app)
                .post('/api/teams/new')
                .expect(302)
                .expect('Location', '/api/auth/loudfailure')
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        describe('Failures', () => {
            it('should respond with an error if not all data is provided', (done) => {
                request(app)
                    .post('/api/teams/join')
                    .set('Authorization', `Bearer ${idToken}`)
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
            it('should respond with an error when provided a team that does not exist', (done) => {
                request(app)
                    .post('/api/teams/join')
                    .set('Authorization', `Bearer ${idToken}`)
                    .send({
                        teamCode: 'NONEXISTENT'
                    })
                    .expect(404)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
            });
        });
        describe('Successes', () => {
            beforeEach(() => {
                return new Promise(async (resolve) => {
                    await Team.create({
                        schoolName: testData.existingSchoolName,
                        contactEmail: testData.existingContactEmail,
                        teamCode: testData.existingTeamCode
                    });
                    resolve();
                });
            });

            afterEach(() => {
                return new Promise(async (resolve) => {
                    let team = await Team.findOne({schoolName: testData.existingSchoolName});
                    await Team.findByIdAndRemove(team._id);

                    let account = await Account.findOne({userID: testData.userID});
                    account.teamCode = '';
                    await account.save();

                    resolve();
                });
            });

            it('should update the user\'s team code', (done) => {
                request(app)
                    .post('/api/teams/join')
                    .set('Authorization', `Bearer ${idToken}`)
                    .send({teamCode: testData.existingTeamCode})
                    .expect(200)
                    .end(async (err) => {
                        if (err) {
                            return done(err);
                        }

                        let user = await Account.findOne({userID: testData.userID});
                        expect(user.teamCode).to.exist.and.to.equal(testData.existingTeamCode);
                        done();
                    });
            });

            it('should add a user ID to the team\'s document', (done) => {
                request(app)
                    .post('/api/teams/join')
                    .set('Authorization', `Bearer ${idToken}`)
                    .send({teamCode: testData.existingTeamCode})
                    .expect(200)
                    .end(async (err) => {
                        if (err) {
                            return done(err);
                        }

                        let user = await Account.findOne({userID: testData.userID});
                        let team = await Team.findOne({teamCode: testData.existingTeamCode});
                        expect(team.users).to.contain(user._id);
                        done();
                    });
            });
        });
    });
});

