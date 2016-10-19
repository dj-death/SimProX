import console = require('../kernel/utils/logger');


export function  logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

export function  customHandler(err, req, res, next) {
    next(err);
}
