var utils = {
    generateRandomTeamCode: function (){
        var selectables = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var teamCode = "";
        for (var i = 0; i < 6; i++) {
            teamCode += selectables.charAt(Math.floor(Math.random() * 35));
        }
        return teamCode;
    }
}

module.exports = utils;