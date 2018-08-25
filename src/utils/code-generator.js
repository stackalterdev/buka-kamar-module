var ObjectId = require('mongodb').ObjectId;
var Hashids = require("hashids");
var moment = require("moment");

module.exports = function (context) {

    var salt = context ? context : new ObjectId().toString();

    var hashids = new Hashids(salt, 8, "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789");
    var now = moment();
    var begin = now.clone().startOf("month");
    var diff = now.diff(begin);
    var code = `${hashids.encode(diff)}`;
    // return salt;
    return code;
};