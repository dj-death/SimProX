"use strict";
var request = require('request');
var config = require('../../config');
// newUserInfo: username, email, password
function registerNodeBB(newUserInfo, cb) {
    request.post({
        url: config.bbs.service + 'api/v1/users',
        headers: {
            Authorization: 'Bearer ' + config.bbs.token
        },
        form: newUserInfo
    }, function (err, res) {
        if (err) {
            console.log('Reister new user for NodeBB failed!' + err);
            return cb(err);
        }
        // TODO BUG Cannot read property uid of undefined
        if (typeof JSON.parse(res.body).payload.uid === 'undefined') {
            console.error("NodeBB Uid", JSON.parse(res.body).payload);
            return cb(JSON.parse(res.body).payload);
        }
        return cb(null, JSON.parse(res.body).payload.uid);
    });
}
exports.registerNodeBB = registerNodeBB;
;
function resetNodeBBPassword(uid, passwordNew) {
    request.put({
        url: config.bbs.service + 'api/v1/users/' + uid + '/password_reset',
        headers: {
            Authorization: 'Bearer ' + config.bbs.token
        },
        form: {
            newPassword: passwordNew
        }
    }, function (err, res) {
        if (err) {
            console.log('reset password for NodeBB failed!' + err);
            return;
        }
    });
}
exports.resetNodeBBPassword = resetNodeBBPassword;
;
function loginNodeBB(username, password, cb) {
    var j = request.jar();
    var requestWithCookie = request.defaults({ jar: j });
    requestWithCookie(config.bbs.service + 'api/config', function (err, response) {
        if (err) {
            return cb(err);
        }
        requestWithCookie.post({
            url: config.bbs.service + 'login',
            headers: {
                'x-csrf-token': JSON.parse(response.body).csrf_token,
                'X-Requested-With:XMLHttpRequest': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': config.bbs.service,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
                'Referer': config.bbs.service + 'login'
            },
            form: {
                username: username,
                password: password,
                remember: 'on',
                returnTo: config.bbs.service
            }
        }, function (err, response) {
            if (err) {
                return cb(err);
            }
            cb(undefined, response.headers['set-cookie']);
        });
    });
}
exports.loginNodeBB = loginNodeBB;
;
//# sourceMappingURL=nodeBB.js.map