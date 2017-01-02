var passport = require('passport');
var BearerStrategy = require('passport-http-bearer');
var AuthenticationClient = require('auth0').AuthenticationClient;

var auth0 = new AuthenticationClient({
    domain: 'danielchao.auth0.com',
    clientId: 'YytKzUCZRb4rn3D6ybVCoPHukSgePHbb'
});

var strategy = new BearerStrategy(async (token, done) => {
    try {
        console.log(token);
        let profile = await auth0.getProfile(token);
        console.log(profile);
        let authResult = (typeof profile === 'undefined' || profile === 'Unauthorized') ? false : JSON.parse(profile);
        console.log(authResult);
        return done(null, authResult);
    } catch (e) {
        return done(e);
    }
});

passport.use(strategy);

module.exports = strategy;

