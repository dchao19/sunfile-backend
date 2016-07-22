var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var strategy = new Auth0Strategy({
    domain: 'danielchao.auth0.com',
    clientID: 'YytKzUCZRb4rn3D6ybVCoPHukSgePHbb',
    clientSecret: 'Bvbh1LP1ZOYNCTGSkI5P4q2DGIRtvW14kFPhLaoMnAdxMLbMRDTHXI1Iwtj1YQM2',
    callbackURL: '/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
});

passport.use(strategy);
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = strategy;

