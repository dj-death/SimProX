"use strict";
var Q = require('q');
var request = require('request');
function get(reqUrl) {
    var deferred = Q.defer();
    request(reqUrl, function (err, response, body) {
        if (err) {
            return deferred.reject(err);
        }
        if (response.statusCode !== 200) {
            return deferred.reject(new Error(response.statusCode.toString()));
        }
        var jsonData;
        try {
            jsonData = JSON.parse(body);
        }
        catch (parseError) {
            return deferred.reject(parseError);
        }
        deferred.resolve(jsonData);
    });
    return deferred.promise;
}
exports.get = get;
function post(reqUrl, data) {
    var deferred = Q.defer();
    var jsonData;
    request.post(reqUrl, { form: data }, function (err, response, body) {
        if (err) {
            return deferred.reject(err);
        }
        try {
            //console.log("............"+body);
            jsonData = JSON.parse(body);
        }
        catch (parseError) {
            return deferred.reject(parseError);
        }
        if (response.statusCode !== 200) {
            var errMsg = '';
            if (jsonData.message) {
                errMsg = jsonData.message;
            }
            if (data.team) {
                errMsg += ', Team ' + data.team;
            }
            return deferred.reject(new Error(response.statusCode.toString() + ' ' + errMsg));
        }
        deferred.resolve(jsonData);
    });
    return deferred.promise;
}
exports.post = post;
//# sourceMappingURL=request.js.map