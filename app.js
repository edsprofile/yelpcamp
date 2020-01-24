var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
//routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");



//get rid of deprecation warnings
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb+srv://edes:%5D*u%22uqQS%3F!--.j%2B%60w9@yelpcamp-iidem.mongodb.net/test?retryWrites=true&w=majority");

// Campground.create(
//     {
//         name: "Granite Hill",
//         image: "https://www.nps.gov/grte/planyourvisit/images/JLCG_tents_Teewinot_2008_mattson_1.JPG?maxwidth=1200&maxheight=1200&autorotate=false",
//         description: "This is a huge granite hill, no bathrooms. No water. Beautiful granite."
//     }, function(err, campground){
//         if(err){
//             console.log("Error!");
//             console.log(err);
//         }
//         else{
//             console.log("Newly created campground!");
//             console.log(campground);
//         }
//     });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seed database
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Some super secret thing that can be anything I want.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//requiring routes
app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000
}
app.listen(port);
