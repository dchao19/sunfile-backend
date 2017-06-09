import * as jwt from 'jsonwebtoken';
const clientSecret = process.env.CLIENT_SECRET;


export const idToken = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    sub: 'auth0|5934d2077f334d35abc7e9ba'},
Buffer.from(clientSecret, 'base64'));
