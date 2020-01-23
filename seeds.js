// TODO: CURRENTLY WORKING ON ERROR DRIVEN DEVELOPMENT
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var seeds = [
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80",
        description: "Beep boop beeeeep"
    },
    {
        name: "Mountain hill",
        image: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=959&q=80",
        description: "Beep boop Mountoon"
    },
    {
        name: "Chilly lake",
        image: "https://images.unsplash.com/photo-1527095655060-4026c4af2b25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra massa mauris, ut tempus quam ullamcorper at. Aliquam eget finibus sapien. Sed semper lobortis nisi ut lobortis. Proin ut leo consequat, luctus sapien vel, cursus eros. Pellentesque aliquam leo nulla, eget scelerisque erat lacinia sit amet. Phasellus porttitor ligula sit amet tellus semper, ut euismod elit mollis. Suspendisse mattis erat ac fringilla rutrum."
    }
];

function seedDB(){
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds!");
        // add a few campgrounds
        seeds.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("added a campground");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great but I wish I had wifi.",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            }
                            campground.comments.push(comment);
                            campground.save();
                            console.log("Created new comment");
                        });
                }
            });
        });

    });
    //add a few comments
}

module.exports = seedDB;
