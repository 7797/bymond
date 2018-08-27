var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ExpressValidator = require('express-validator');
var multer = require('multer');
var upload = multer({ dest: '/uploads' });
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
//var ftpClient = require('ftp-client'),
//client = new ftpClient(config, options);
var ftpClient = require('./lib/client.js'),
    config = {
        host: 'ftp.sensibridge.com',
        port: 21,
        user: 'bymond@bymond.com',
        password: 'pritham@sensibridge'
    },
    options = {
        logging: 'basic'
    },
    client = new ftpClient(config, options);

client.connect(function() {

    client.upload(['index'], '/app.js', {
        baseDir: 'nodeauth',
        overwrite: 'older'
    }, function(result) {
        console.log(result);
    });

    client.download('/views/index', '/desktop', {
        overwrite: 'all'
    }, function(result) {
        console.log(result);
    });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//handle Session
app.use(session({
    secret: 'secret',
    saveUnitilized: true,
    resave: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());
//validator
app.use(ExpressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.plit('_'),
            root = namespace.shift(),
            formPram = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }

}));

app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});




module.exports = app;