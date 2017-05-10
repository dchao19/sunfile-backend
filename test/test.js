import 'babel-polyfill';
import should from 'should';
import request from 'supertest';
import app from '../server.js';

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
        it('should respond with an error if not all data is provided', (done) => {
            request(app)
                .post('/api/teams/new')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RhbmllbGNoYW8uYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAxNDYzODk0OTczNjM5OTMzMTcyIiwiYXVkIjoiWXl0S3pVQ1pSYjRybjNENnliVkNvUEh1a1NnZVBIYmIiLCJleHAiOjE0OTA5NjIyNjksImlhdCI6MTQ5MDkyNjI2OX0.0LI4Vly2VkCWvWPvJuTlWYv08H0qJSMaCMmJOFRGlz4')
                .expect(400)
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
});
