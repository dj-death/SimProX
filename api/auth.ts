let passport = require('passport');
import util = require('util');

import console = require('../kernel/utils/logger');


export function  checkSession(req, res, next) {
    // Access the session as req.session 
    let sess = req.session

    if (sess.views) {
        sess.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + sess.views + '</p>')
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
        res.end()
    } else {
        sess.views = 1
        res.end('welcome to the session demo. refresh!')
    }
}



export function  login(req, res, next) {


    passport.authenticate('local', { failureFlash: true }, function  (err, user) {
        console.info('flash:' + req.flash('message'));

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(400).send('Seminar has not been opened or incorrect password.');
        }

        req.logIn(user, function  (err) {
            console.info('user:' + util.inspect(user, {depth:null}));

            if (err) {
                console.log('err:' + err);
                return next(err);
            }

            if (req.body.rememberme) {
                req.session.cookie = req.session.cookie || {};
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
            }

            req.session.user = user;

            res.status(200).json(user);

        });

    })(req, res, next);
}


export function  logout(req, res) {
    req.logout();
    res.status(200).send();
}