global.debug_data = global.debug_data || {};
process.env.JWT_SECRET = 'didi';


import http = require('http');
import path = require('path');

let express = require('express');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let compression = require('compression');
let session = require('express-session');
let multer = require('multer');
let errorHandler = require('errorhandler');
let cors = require('cors');


let mongoose = require('mongoose');

mongoose.Promise = require('q').Promise;

let sio = require('socket.io');
let socketAsPromised = require('socket.io-as-promised');
let passport = require('passport');
let flash = require('connect-flash');

let app = express();
let server = http.createServer(app);
let io = sio.listen(server);
let socketioJwt = require("socketio-jwt");

io.use(socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    handshake: true
}));

io.use(socketAsPromised());


import logger = require('./utils/logger');

import config = require('./config');

import routes = require('./routes/index');

import SeminarModel = require('./api/models/seminar/Seminar');

import iSocketio = require('./api/utils/socketio');

let expressValidator = require('express-validator');
import customValidator = require('./api/utils/express-custom-validator');



// settings
const server_port = process.env.OPENSHIFT_NODEJS_PORT || config.server.port || process.env.port;
const server_host = process.env.OPENSHIFT_NODEJS_IP || config.server.host || '127.0.0.1';
const mongo_conn = !process.env.OPENSHIFT_MONGODB_DB_URL ? config.server.mongo_conn : process.env.OPENSHIFT_MONGODB_DB_URL + "engine";

app.set('port', server_port);


// set our default template engine to "jade"
// which prevents the need for extensions
app.set('view engine', 'ejs');
// set views for error and 404 pages
app.set('views', path.join(__dirname, 'views'));



try {
    // serve static files
    //app.use(express.static(path.join("I:/dash")));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(favicon(path.join(__dirname, '/public/favicon.ico')));



} catch (e) {
    console.log(e);
    console.log(JSON.stringify(e));
}


app.use(logger);
app.use(flash());



// session support
app.use(passport.initialize());



/*
let whitelist = ['http://localhost:1841', 'http://localhost:1337'];

let corsOptions = {
    origin: function (origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    }
};

app.use(cors(corsOptions));
*/

// parse request bodies (req.body)

app.use(compression({
    filter: function shouldCompress(req, res) {
        if (req.headers['x-no-compression']) {
            // don't compress responses with this request header
            return false;
        }

        // fallback to standard filter function
        return compression.filter(req, res)
    }
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// allow overriding methods in query (?_method=put)
app.use(methodOverride());



app.use(expressValidator({
    customValidators: customValidator
}));


// Routing
app.use('/', routes.get(io));




app.get('/status', function (req, res, next) {
    var stats = {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
    };
    res.json(stats);
});


// TEST
/*app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
})*/




// catch 404 and forwarding to error handler
app.use(function (req, res, next) {

    if (req.user) {
        return next();
    }

    res.status(404);


    if (app.get('env') !== 'production') {

    }

    // respond with json
    if (/application\/json/.test(req.get('accept'))) {
        res.send({ message: '404 Not found! URL: ' + req.url });
        return;
    }


    // respond with html page
    res.set('Content-Type', 'text/html; charset=utf-8');
    if (req.accepts('html')) {

        res.render('page404.ejs', {
            'title': '404 Page Not Found',
            'url': req.url
        });

        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});



app.use(function (err, req, res, next) {
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().



    if ((typeof err.message !== 'undefined' && err.message.toLowerCase().substr(0, 6) == 'cancel') || typeof err.errorCode !== 'undefined') {
        // respond promise stop chains info with no system error

        console.log('400 Error. ', 'Message:', err.message);

        res.status(err.status || 400);

        // respond with json
        if (/application\/json/.test(req.get('accept'))) {
            res.send({
                title: '400 Data Error',
                message: err.message,
                errorCode: err.errorCode
            });

            return;
        }

        res.set('Content-Type', 'text/html; charset=utf-8');
        // respond with html page
        if (req.accepts('html')) {
            res.render('page500.ejs', {
                'title': '400 Data Error',
                'error': err.message
            });

            return;
        }



    } else if (err.name === 'UnauthorizedError') {
        console.info(err.name, req.url);

        if (req.url.indexOf('e4e') !== -1) {
            return res.redirect('/e4e/login');

        } else if (req.url.indexOf('admin') !== -1) {
            return res.redirect('/stratege/admin');

        } else {
            return res.redirect('/stratege/login');
        }

    } else {
        // respond 500 system error

        console.info(err);

        res.status(err.status || 500);

        // respond with json
        if (/application\/json/.test(req.get('accept'))) {
            res.send({
                title: '500 System Error',
                message: err.message
            });
            return;
        }

        res.set('Content-Type', 'text/html; charset=utf-8');
        // respond with html page
        if (req.accepts('html')) {
            res.render('page500.ejs', {
                'title': '500 System Error',
                'error': err.message
            });
            return;
        }

    }



});





try {
    mongoose.connect(mongo_conn);

    let db = mongoose.connection;

    db.on('error', console.log.bind(console, 'connection error:'));

    db.once('open', function (response, request) {

        console.log('Connection to DB successful :' + mongo_conn);

        server.listen(app.get('port'), server_host, function () {
            console.log('Server listening on port ' + app.get('port'));
        });
		
		global.gsocketio = io;
		iSocketio.init(io);

    });

} catch (e) {
    console.log(e);
}


// error handling middleware should be loaded after the loading the routes
if (app.get('env') === 'development') {

    var codein = require("node-codein");

    app.use(errorHandler());
}

server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        let msg = 'Address ' + server.address() + ' already in use! You need to pick a different host and/or port.';

        console.log(err);
        console.log(msg);
    }

    return process.exit(1);
});



/*
let pm2 = require('pm2');

pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.start({
        script: 'server.js',         // Script to be run
        exec_mode: 'cluster',        // Allow your app to be clustered
        instances: 4,                // Optional: Scale your app by 4
        max_memory_restart: '100M'   // Optional: Restart your app if it reaches 100Mo
    }, function (err, apps) {
        pm2.disconnect();   // Disconnect from PM2
        if (err) throw err
    });
});
*/