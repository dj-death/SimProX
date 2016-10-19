let request = require('request');
let crypto = require('crypto');

import config = require('../../../config');

function  Message() {

    this.appid = config.messageConfig.appid;
    this.signtype = config.messageConfig.signtype;
    this.appkey = config.messageConfig.appkey;

    this.send = function (params) {
        let api = 'https://api.submail.cn/message/send.json';
        let requestParams = params;
        requestParams['appid'] = this.appid;
        let self = this;
        request({
            uri: 'https://api.submail.cn/service/timestamp.json',
            method: 'GET'
        }, function (error, response, body) {
            let result = JSON.parse(body);
            requestParams['timestamp'] = result["timestamp"];
            requestParams['sign_type'] = self.signtype;
            requestParams['signature'] = self.createSignature(requestParams);
            request.post({url: api, form: requestParams}, function  optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('SMS upload failed:', err);
                }
                console.log('SMS upload successful!  Server responded with:', body);
            });
        });
    };

    this.xsend = function (params, cb) {
        let api = 'https://api.submail.cn/message/xsend.json';
        let requestParams = params;
        requestParams['appid'] = this.appid;
        let self = this;
        request({
            uri: 'https://api.submail.cn/service/timestamp.json',
            method: 'GET'
        }, function (error, response, body) {
            if(error) {
               return cb(error);
            }
            let result = JSON.parse(body);
            requestParams['timestamp'] = result["timestamp"];
            requestParams['sign_type'] = self.signtype;
            requestParams['signature'] = self.createSignature(requestParams);
            request.post({url: api, form: requestParams}, function  optionalCallback(err, httpResponse, body) {
                if (err) {
                    console.error('SMS upload failed:', err);
                    return cb(error);
                }
                console.log('SMS upload successful!  Server responded with:', body);
                return cb(undefined, body);
            });
        });
    };

    this.subscribe = function (params) {
        let api = 'https://api.submail.cn/addressbook/message/subscribe.json';
        let requestParams = params;
        requestParams['appid'] = this.appid;
        let self = this;
        request({
            uri: 'https://api.submail.cn/service/timestamp.json',
            method: 'GET'
        }, function (error, response, body) {
            let result = JSON.parse(body);
            requestParams['timestamp'] = result["timestamp"];
            requestParams['sign_type'] = self.signtype;
            requestParams['signature'] = self.createSignature(requestParams);
            request.post({url: api, form: requestParams}, function  optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('SMS upload failed:', err);
                }
                console.log('SMS upload successful!  Server responded with:', body);
            });
        });
    };

    this.unsubscribe = function (params) {
        let api = 'https://api.submail.cn/addressbook/message/unsubscribe.json';
        let requestParams = params;
        requestParams['appid'] = this.appid;
        let self = this;
        request({
            uri: 'https://api.submail.cn/service/timestamp.json',
            method: 'GET'
        }, function (error, response, body) {
            let result = JSON.parse(body);
            requestParams['timestamp'] = result["timestamp"];
            requestParams['sign_type'] = self.signtype;
            requestParams['signature'] = self.createSignature(requestParams);
            request.post({url: api, form: requestParams}, function  optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('SMS upload failed:', err);
                }
                console.log('SMS upload successful!  Server responded with:', body);
            });
        });
    };

    this.createSignature = function (params) {
        if (this.signtype == 'normal') {
            return this.appkey;
        } else {
            return this.buildSignature(params);
        }
    };

    this.buildSignature = function (params) {
        let sortedParams = this.sortOnKeys(params);
        let signStr = "";
        for(let key in sortedParams) {
            signStr += key + '=' + sortedParams[key] + '&';
        }
        signStr = signStr.substring(0, signStr.length-1);
        signStr = this.appid + this.appkey + signStr + this.appid + this.appkey;
        if (this.signtype == 'md5') {
            let md5sum = crypto.createHash('md5');
            md5sum.update(signStr);
            return md5sum.digest('hex');
        }
        if (this.signtype == 'sha1') {
            let sha1sum = crypto.createHash('sha1');
            sha1sum.update(signStr);
            return sha1sum.digest('hex');
        }
        return '';
    };

    this.sortOnKeys = function (dict) {
        let sorted = [];
        for(let key in dict) {
            if (key == 'attachments') {
                continue;
            }
            sorted[sorted.length] = key;
        }
        sorted.sort();

        let tempDict = {};
        for(let i = 0; i < sorted.length; i++) {
            tempDict[sorted[i]] = dict[sorted[i]];
        }

        return tempDict;
    };
};


export = Message;
