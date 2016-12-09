"use strict";
/**
 * Socket.io configuration
 */
let _ = require('lodash');
const seminarModel = require('../models/Seminar');
const userRole = require('../models/user/UserRole');
const console = require('../../kernel/utils/logger');
let jwt = require("jsonwebtoken");
// When the user disconnects.. perform this
function onDisconnect() {
    console.log('User DISCONNECTED SocketIO');
}
// When the user connects.. perform this
function onConnect(socket) {
    // When the client emits 'debuginfo', this listens and executes
    socket.on('debugInfo', function (data) {
        console.info('[%s] %s', socket.handshake.address, JSON.stringify(data, null, 2));
    });
    // Insert sockets below
    //  require('../api/thing/thing.socket').register(socket);
}
function init(socketio) {
    // socket.io (v1.x.x) is powered by debug.
    // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
    //
    // ex: DEBUG: "http*,socket.io:socket"
    // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
    //
    // 1. You will need to send the token in `client/components/socket/socket.service.js`
    //
    // 2. Require authentication here:
    // socketio.use(require('socketio-jwt').authorize({
    //   secret: config.secrets.session,
    //   handshake: true
    // }));
    socketio.on('connection', function (socket) {
        let token = socket.decoded_token && socket.decoded_token.name || socket.handshake.query.token;
        let roomMarksimosCompany;
        let roomSeminar;
        if (!token) {
            socket.disconnect('unauthorized');
            return;
        }
        // verifies secret and checks exp
        console.log(token);
        try {
            jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
                if (err || user === null) {
                    console.error(err);
                    socket.disconnect('unauthorized');
                }
                else {
                    if (userRole.roleList.student.id == user.role) {
                        seminarModel.findSeminarByUserId(user._id).then(function (seminarResult) {
                            let company = _.find(seminarResult.companyAssignment, function (company) {
                                return company.studentList.indexOf(user.email) > -1;
                            });
                            roomMarksimosCompany = seminarResult.seminarId.toString() + company.companyId.toString();
                            socket.join(roomMarksimosCompany);
                            roomSeminar = seminarResult.seminarId.toString();
                            socket.join(roomSeminar);
                        }).fail(function (err) {
                            console.error(err);
                        }).done();
                    }
                    else if (!_.isUndefined(socket.handshake.query.seminarId && userRole.roleList.facilitator.id == user.role)) {
                        seminarModel.findOneQ({ seminarId: socket.handshake.query.seminarId }).then(function (seminarResult) {
                            if (user._id.equals(seminarResult.facilitatorId)) {
                                socket.join(socket.handshake.query.seminarId);
                            }
                        }).fail(function (err) {
                            console.error(err);
                        }).done();
                    }
                }
            });
        }
        catch (err) {
            console.error(err);
        }
        //socket.address = socket.handshake.address + ':' + socket.handshake.address.port;
        //socket.connectedAt = new Date();
        // Call onDisconnect.
        socket.on('disconnect', onDisconnect);
        //console.log('User CONNECTED SocketIO: ' + token + '. Address: ' + socket.handshake.address + '. Time: ' + socket.handshake.time);
        // Call onConnect. API routes for Socket.IO
        onConnect(socket);
    });
}
exports.init = init;
;
function emitMarksimosDecisionUpdate(roomName, data) {
    global.gsocketio.to(roomName).emit('marksimosDecisionUpdate', data);
}
exports.emitMarksimosDecisionUpdate = emitMarksimosDecisionUpdate;
;
function emitMarksimosChatMessageSeminar(roomName, user, message) {
    global.gsocketio.to(roomName).emit('marksimosChatMessageSeminarUpdate', {
        user: _.pick(user, 'username', 'avatar'),
        message: message
    });
}
exports.emitMarksimosChatMessageSeminar = emitMarksimosChatMessageSeminar;
;
function emitMarksimosChatMessageCompany(roomName, user, message) {
    global.gsocketio.to(roomName).emit('marksimosChatMessageCompanyUpdate', {
        user: _.pick(user, 'username', 'avatar'),
        message: message
    });
}
exports.emitMarksimosChatMessageCompany = emitMarksimosChatMessageCompany;
;
//# sourceMappingURL=socketio.js.map