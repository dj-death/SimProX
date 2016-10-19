"use strict";
var winston = require('winston');
winston.emitErrs = true;
var date = (new Date()).toLocaleString().replace(/:/g, "-");
var suffix = '@' + date + ".log";
var wLogger = new (winston.Logger)({
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'silly',
            handleExceptions: true,
            json: false,
            colorize: true,
            prettyPrint: true,
            depth: 2
        }),
        new (winston.transports.File)({
            name: 'Engine',
            filename: './log/Engine' + suffix,
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'log',
            //eol: 'rn', // for Windows, or `eol: ‘n’,` for *NIX OSs
            handleExceptions: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false,
            zippedArchive: process.env.NODE_ENV === 'production'
        })
    ]
});
module.exports = wLogger;
//# sourceMappingURL=logger.js.map