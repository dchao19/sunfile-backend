module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(401).json({
            success: false,
            message: 'unauthorized',
            errCode: -100,
            errMessage: "You are not logged in."
        });
    }
    next();
};
