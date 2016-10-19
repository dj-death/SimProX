"use strict";
var util = require('util');
var fs = require('fs');
var Q = require('q');
var request = require('request');
var _ = require('underscore'); // npm install underscore to install
var sendCloud = {
    module: {
        mail: 'mail',
        stats: 'stats',
        list: 'list'
    },
    action: {
        send: 'send',
        send_template: 'send_template'
    },
    format: {
        json: 'json',
        xml: 'xml'
    }
};
var serverSettingsDefault = {
    url: 'http://sendcloud.sohu.com/',
    sendCloudModule: 'mail',
    action: 'send_template',
    format: 'json',
    api_user: 'jinwangmailsendkey',
    api_key: 'Az6VfYykm1NoO3XP',
    from: 'mailsub@hcdlearning.com',
    fromname: 'HCD Learning webmaster',
    to: 'jinwyp@163.com',
    cc: '',
    subject: '欢迎使用HCD Learning！',
    html: '',
    template_invoke_name: '',
    substitution_vars: '',
    headers: '',
    gzip_compress: 'false'
};
// Export createTransport method
function createEmailSender(sendmethod, serversettings) {
    if (sendmethod === void 0) { sendmethod = 'webapi'; }
    if (serversettings === void 0) { serversettings = serverSettingsDefault; }
    serversettings = _.extend(serverSettingsDefault, serversettings);
    return new NodemailerSendCloud(sendmethod, serversettings);
}
exports.createEmailSender = createEmailSender;
;
/**
 * Creates an object for exposing the NodemailerSendCloud API
 *
 * @constructor
 * @param {Object} transporter Transport object instance to pass the mails to
 */
function NodemailerSendCloud(sendmethod, serversettings) {
    this.sendMethod = sendmethod;
    this.module = sendCloud.module[serversettings.sendCloudModule];
    this.action = sendCloud.action[serversettings.action];
    this.format = sendCloud.format[serversettings.format];
    this.serverSettings = serversettings;
}
NodemailerSendCloud.prototype.sendMail = function (mail, callback) {
    mail.api_user = this.serverSettings.api_user;
    mail.api_key = this.serverSettings.api_key;
    mail.from = mail.from || this.serverSettings.from;
    mail.to = mail.to || this.serverSettings.to;
    mail.subject = mail.subject || this.serverSettings.subject;
    mail.html = mail.html || this.serverSettings.html;
    mail.template_invoke_name = mail.template_invoke_name || this.serverSettings.template_invoke_name;
    mail.substitution_vars = mail.substitution_vars || this.serverSettings.substitution_vars;
    mail.substitution_vars = JSON.stringify(mail.substitution_vars);
    var queryUrl = this.serverSettings.url + this.sendMethod + '/' + this.module + '.' + this.action + '.' + this.format;
    var postUrl = queryUrl;
    if (this.serverSettings.action === sendCloud.action.send) {
        queryUrl = queryUrl + '?api_user=' + this.serverSettings.api_user + '&api_key=' + this.serverSettings.api_key;
        queryUrl = queryUrl + '&from=' + mail.from + '&to=' + mail.to + '&subject=' + mail.subject + '&html=' + mail.html;
        request(queryUrl, function (error, response, body) {
            if (error) {
                return callback(error);
            }
            if (response.statusCode == 200) {
                return callback(null, body);
            }
            else {
                return callback(null, response);
            }
        });
        console.log("Email queryUrl: ", queryUrl);
    }
    else {
        // use email template_invoke_name to send email
        //queryUrl = queryUrl + '&from=' + mail.from + '&fromname=' + mail.fromname + '&template_invoke_name=' + mail.template_invoke_name + '&subject=' + mail.subject + '&substitution_vars=' + JSON.stringify(mail.substitution_vars);
        request.post({ url: postUrl, form: mail }, function optionalCallback(error, httpResponse, body) {
            if (error) {
                return callback(error);
            }
            if (httpResponse.statusCode == 200) {
                return callback(null, body);
            }
            else {
                return callback(null, body);
            }
        });
        console.log("Email postUrl: ", postUrl);
    }
};
NodemailerSendCloud.prototype.sendMailQ = function (mail) {
    var deferred = Q.defer();
    mail.api_user = this.serverSettings.api_user;
    mail.api_key = this.serverSettings.api_key;
    mail.from = mail.from || this.serverSettings.from;
    mail.to = mail.to || this.serverSettings.to;
    mail.subject = mail.subject || this.serverSettings.subject;
    mail.html = mail.html || this.serverSettings.html;
    mail.template_invoke_name = mail.template_invoke_name || this.serverSettings.template_invoke_name;
    mail.substitution_vars = mail.substitution_vars || this.serverSettings.substitution_vars;
    mail.substitution_vars = JSON.stringify(mail.substitution_vars);
    var queryUrl = this.serverSettings.url + this.sendMethod + '/' + this.module + '.' + this.action + '.' + this.format;
    var postUrl = queryUrl;
    if (this.serverSettings.action === sendCloud.action.send) {
        queryUrl = queryUrl + '?api_user=' + this.serverSettings.api_user + '&api_key=' + this.serverSettings.api_key;
        queryUrl = queryUrl + '&from=' + mail.from + '&to=' + mail.to + '&subject=' + mail.subject + '&html=' + mail.html;
        request(queryUrl, function (error, response, body) {
            if (error) {
                return deferred.reject(error);
            }
            if (response.statusCode == 200) {
                return deferred.resolve(body);
            }
            else {
                return deferred.resolve(body);
            }
        });
        console.log("Email queryUrl: ", queryUrl);
    }
    else {
        // use email template_invoke_name to send email
        //queryUrl = queryUrl + '&from=' + mail.from + '&fromname=' + mail.fromname + '&template_invoke_name=' + mail.template_invoke_name + '&subject=' + mail.subject + '&substitution_vars=' + mail.substitution_vars;
        request.post({ url: postUrl, form: mail }, function optionalCallback(error, httpResponse, body) {
            if (error) {
                return deferred.reject(error);
            }
            if (httpResponse.statusCode == 200) {
                return deferred.resolve(body);
            }
            else {
                return deferred.resolve(body);
            }
        });
        console.log("Email PostUrl: ", postUrl);
    }
    return deferred.promise;
};
//# sourceMappingURL=sendCloud.js.map