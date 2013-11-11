/**
 * Date manipulation utils
 */

exports.format = function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    return y+'-'+m+'-'+d;
}

exports.parse = function(str) {
    var split = str.split('-');
    var y = split[0];
    var m = split[1] - 1;
    var d = split[2];
    return new Date(y, m, d);
}

exports.add = function(date, days) {
    var date_to = new Date(date);
    date_to.setDate(date_to.getDate() + days);
    return date_to;
}

exports.diff = function(date_from, date_to) {
    return Math.floor(( date_to - date_from ) / 86400000);
}