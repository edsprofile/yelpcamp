var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var nodemailer = require("nodemailer");
var async = require("async");
var crypto = require("crypto"); // does not need to be installed with npm

router.get("/", function(req,res){
    res.render("landing");
});

// ====================
// AUTH ROUTES
// ====================

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, email: req.body.email})
    // provided by passport local mongoose
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req, res){
});

// forgot password
router.get("/reset-password", function(req, res){
    res.render("reset-password");
});

// reset password route
router.post("/reset-password", function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, foundUser){
                if(err){
                    req.flash("error", "Invalid email, no user with that email address.");
                    return res.redirect("reset-password");
                }

                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpires = Date.now() + 3600000;

                foundUser.save(function(err){
                    done(err, token, foundUser);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "e5a2da9674d8cc",
                    pass: process.env.MAILTRAPPW
                }
            });
            var mailOptions ={
                to: user.email,
                from: "someone@yelpcamp.com",
                subject: "yelpcamp password reset",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions");
                done(err, "done");
            });
        }
    ],function(err){
        if(err){
            return next(err);
        }
        res.redirect("/reset-password");
    });
});

router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() }}, function(err, foundUser){
        if(!foundUser){
            req.flash("error", "Password reset token invalid or expired.");
            return res.redirect("/reset-password");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, foundUser){
                if(!foundUser){
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm){
                    foundUser.setPassword(req.body.password, function(err){
                        foundUser.resetPasswordToken = undefined;
                        foundUser.resetPasswordExpires = undefined;

                        foundUser.save(function(err){
                            req.logIn(foundUser, function(err){
                                done(err, foundUser);
                            });
                        });
                    });
                }
                else{
                    req.flash("error", "Passwords do not match");
                    return res.redirect("back");
                }
            });
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "e5a2da9674d8cc",
                    pass: process.env.MAILTRAPPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "someone@yelpcamp.com",
                subject: "Your password has been changed",
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "Success your pasword has been changed.");
                done(err);
            });
        }
    ], function(err){
        res.redirect("/campgrounds");
    });
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
