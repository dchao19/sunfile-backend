let alchemyApiKey = (typeof process.env.ALCHEMY_API_KEY === 'undefined') ? "" : process.env.ALCHEMY_API_KEY;
let aylienAppId = (typeof process.env.AYLIEN_API_ID === 'undefined') ? "" : process.env.AYLIEN_API_ID;
let aylienAppKey = (typeof process.env.AYLIEN_API_KEY === 'undefined') ? "": process.env.AYLIEN_API_KEY;
let authUserUpdate = (typeof process.env.AUTH_USER_UPDATE_TOKEN === 'undefined') ? "" : process.env.AUTH_USER_UPDATE_TOKEN;

module.exports = {
    alchemy: alchemyApiKey,
    aylien: {
        appId: aylienAppId,
        key: aylienAppKey
    },
    authUserUpdate: authUserUpdate
};
