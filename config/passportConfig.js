var passport = require('passport');
var passportJWT = require('passport-jwt');
var Account = require('../models/Account');

import {requestProfile} from './requestProfile';

let ExtractJWT = passportJWT.ExtractJwt;
let JWTStrategy = passportJWT.Strategy;

let jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: Buffer.from(process.env.CLIENT_SECRET, 'base64'),
    passReqToCallback: true
};

let serializer = async (req, jwtPayload, done) => {
    try {
        let user = await Account.findOne({userID: jwtPayload.sub});
        if (user) {
            return done(null, user);
        }
        let jwt = req.headers.authorization;
        jwt = jwt.substring(jwt.indexOf(' ') + 1);

        let userProfile = await requestProfile(jwt);

        let userData = {
            email: userProfile.email,
            name: userProfile.name,
            userID: jwtPayload.sub
        };

        let newUser = new Account(userData);
        await newUser.save();

        return done(null, newUser);
    } catch (e) {
        console.log(e);
        return done(e, false);
    }
};

// var strategy = new BearerStrategy(async (token, done) => {
//     try {
//         // let user = await Account.findOne({userID: jwtPayload.sub})
//         //let profile = await auth0.getProfile(token);
//         console.log(profile);
//         let authResult = (typeof profile === 'undefined' || profile === 'Unauthorized') ? false : JSON.parse(profile);
//         return done(null, authResult);
//     } catch (e) {
//         return done(e);
//     }
// });

passport.use(new JWTStrategy(jwtOptions, serializer));

