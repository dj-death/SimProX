let winston = require('winston');
let expressWinston = require('express-winston');

winston.emitErrs = true;


let date = (new Date()).toLocaleString().replace(/:/g, "-");
let suffix = '@' + date + ".log";


let wLogger = new (expressWinston.logger)({
    exitOnError: false,

    transports: [
        new (winston.transports.Console)({
            level: 'silly', // info ++
            handleExceptions: true,
            json: false, 
            colorize: true,
            prettyPrint: true,
            depth: 2
        }),

        new (winston.transports.File)({
            name: 'server-log',
            filename: './log/Server-Log' + suffix,
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'silly',

            //eol: 'rn', // for Windows, or `eol: ‘n’,` for *NIX OSs

            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,

            zippedArchive: process.env.NODE_ENV === 'production'
        })
    ]
});

export = wLogger;