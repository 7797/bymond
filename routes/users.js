var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register' });
});
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
});
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/users/login', 
    failureFlash: 'Invalid username or password' }),
    function(req, res) {
        req.flash('success', 'You are now logged in');
        res.redirect('/');
    });
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'unknown User' });
        }
        User.comparePassword(password, user.password, function(err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid Password' });
            }
        });
    });
}));
router.post('/register', function(req, res, next) {
    console.log(req.body.name);
    console.log(req.body.email);
    console.log(req.body.username);
    console.log(req.body.psw);
    console.log(req.body.psw2);

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.psw;
    var password2 = req.body.psw2;

    req.checkBody('name', 'Name field is required').notEmpty();
    // req.checkBody('email', 'Email field is required').notEmpty();
    // req.checkBody('email', 'Email is not valid').isEmail();
    // req.checkBody('username', 'Username field is required').notEmpty();
    // req.checkBody('password', 'Password field is required').notEmpty();
    // req.checkBody('password2', 'Entar same password').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        consiole.log('Errors');

    } else {
        console.log('No Errors');
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log(user);

        });
        res.location('/');
        res.redirect('/');
    }

});

module.exports = router;