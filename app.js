const express = require('express');
const session = require('express-session');
const pug = require('pug');
const mongoose = require('mongoose');
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const User = require("./models/UserModel");
const Review = require("./models/ReviewModel");
const Notification = require("./models/NotificationModel");

const app = express();
const port = 3000;
let contributing;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'safe session' }));

let auth = (req, res, next) => {
    if (!req.session.loggedIn) {
        res.status(401).redirect('/login');
        return;
    }
    next();
};

let generateNotifications = async (res, type, movie, subject)=>{
    let invalid = false;
    switch(type){
        case "Person":{
            for(let person of subject){
                let notification = new Notification();
                notification.movie = movie._id;
                notification.subjectType = type;
                notification.subject = mongoose.Types.ObjectId(person);
                notification.date = Date.now();
                await Person.findById(mongoose.Types.ObjectId(person)).then(function(result){
                    notification.notificationText = `'${movie.title}' was added, and it credits ${result.name}`;
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                    return;
                })
                await Notification.create(notification).then(async function(result){
                    let toPush = {notification: result._id, read:false};
                    await User.updateMany({personsFollowing: mongoose.Types.ObjectId(person)}, { $push: { notifications: toPush} }).then(function(results){

                    }).catch(function(err){
                        console.error(err);
                        res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                        invalid = true;
                        return;
                    });
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                    invalid = true;
                    return;
                });
            }
            if(!invalid){
                res.status(201).send(JSON.stringify({ status: "201", movie: movie }));
            }
            break;
        }
        default:{
            let notification = new Notification();
            notification.movie = mongoose.Types.ObjectId(movie);
            notification.subjectType = "User";
            await Movie.findById(notification.movie).then(function(result){
                notification.notificationText = `${subject.username} just reviewed '${result.title}'`;
            }).catch(function(err){
                console.error(err);
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            });
            notification.subject = subject._id;
            notification.date = Date.now();
            await Notification.create(notification).then(async function(result){
                let toPush = {notification: result._id, read:false};
                await User.updateMany({usersFollowing: subject._id}, { $push: { notifications: toPush} }).then(function(results){
                    res.status(201).send(JSON.stringify({ status: "201" }));
                    return;
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                    return;
                });
            }).catch(function(err){
                console.error(err);
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            });
        }
    }
}

app.get(['/login', '/login.html'], (req, res) => {
    if(!req.session.loggedIn)
        res.sendFile('login.html', { root: './public' });
    else
        res.redirect("/");
});

app.post(['/login', '/login.html'], (req, res) => {
    if(req.session.loggedIn)
        res.redirect("/");
    else{
        User.findOne(req.body).exec(function (err, userData) {
            if (err) {
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            }
            if (userData && Object.keys(userData).length > 0) {
                req.session.loggedIn = true;
                req.session.loggedInUser = userData;
                contributing = req.session.loggedInUser.contributingUser
                res.status(200).send(JSON.stringify({ status: "200" }));
            }
            else {
                res.status(403).send(JSON.stringify({ status: "403", error: "Invalid username/password." }));
            }
        });
    }
});

app.get(['/signup', '/signup.html'], (req, res) => {
    if(req.session.loggedIn)
        res.redirect("/");
    else
        res.sendFile('signup.html', { root: './public' });
});

app.post(['/signup', '/signup.html'], (req, res) => {
    if(req.session.loggedIn)
        res.redirect("/");
    else{
        User.findOne({ username: req.body.username }, function (err, userData) {
            if (err) {
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            }
            if (userData && Object.keys(userData).length > 0) {
                res.status(400).send(JSON.stringify({ status: "400", error: "A user with that username already exists, please pick another username." }));
            }
            else {
                let newUser = new User();
                newUser.username = req.body.username;
                newUser.password = req.body.password;
                newUser.contributingUser = req.body.contributingUser;
                newUser.dateAccountCreated = Date.now();

                User.create(newUser).then(function (result) {
                    req.session.loggedIn = true;
                    req.session.loggedInUser = result;
                    contributing = req.session.loggedInUser.contributingUser
                    res.status(200).send(JSON.stringify({ status: "200" }));
                }).catch(function (err) {
                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                    return;
                });
            }
        });
    }
});

app.use(express.static('public'));

// from hereon, ensure that user is authenticated
app.use(auth);

/*
app.get('/createMovie', (req,res)=>{
    res.sendFile('createMovie.html', {root: './public'});
});

app.get('/createPerson', (req,res)=>{
    res.sendFile('createPerson.html', {root: './public'});
});
*/

app.get(['/', '/index'], (req, res) => {
    let loggedIn = true;
    User.findById(req.session.loggedInUser._id).populate({
        path: 'reviews',
        populate: { path: 'movie' }
    }).populate("usersFollowing").populate("watchlist").populate("usersFollowedBy").populate("personsFollowing").exec(
        function (err, userResult) {
            if (err) {
                console.error(err);
                res.status(500).send("Error reading database.");
                return;
            }
            currentUser = userResult;
            currentUser.dateAccountCreated = new Date(currentUser.dateAccountCreated);
            let genres = [];
            for(let review of currentUser.reviews){
                if(review.rating > 6){
                    genres.push(review.movie.genre[0]);
                }
            }
            for(let movie of currentUser.watchlist){
                genres.push(movie.genre[0]);
            }
            Movie.find({genre: {$in: genres}}).exec(function(err, results){
                if (err) {
                    console.error(err);
                    res.status(500).send("Error reading database.");
                    return;
                }
                if(results.length > 10){
                    currentUser.recommendedMovies = results.slice(0, 10);
                }
                else{
                    currentUser.recommendedMovies = results;
                }
                res.send(pug.renderFile('./templates/profileTemplate.pug', { currentUser, loggedIn, contributing }));
            });
        }
    );
});

app.get(['/index/notifications'], (req, res) => {
    User.findById(req.session.loggedInUser._id).populate({
        path:"notifications.notification",
        populate:{
            path: "subjectId"
        }
    }).exec(function(err, results){
        if(err){
            res.status(500).send(JSON.stringify({status: "500", error:"Error reading database."}));
            return;
        }
        res.status(200).send(JSON.stringify({status:"200", data: results.notifications}));
    });
   /* let not = {};
    let n = {};
    for (let i of notifs) {
        n = notifications[i];
        let d = new Date(n["date"]);
        not[i] = { message: getNotif(n), timeAgo: Math.floor((new Date() - d) / (1000 * 60 * 60 * 24)) + "d ago", read: n.read, date: d };
    }
    not = Object.fromEntries(Object.entries(not).sort(([k1, v1], [k2, v2]) => {
        return v1.date < v2.date;
    }));
    console.log(not);
    res.send(not);*/
});

app.put('/users/switchType', (req, res)=>{
    User.updateOne({_id:req.session.loggedInUser._id}, {contributingUser: !contributing}).exec(
        function(err, result){
            if (err) {
                console.error(err);
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            }
            contributing = !contributing;
            res.status(200).send(JSON.stringify({ status: "200" }));
        }
    );
});

app.get(['/users/:userId'], (req, res, next) => {
    if (mongoose.Types.ObjectId(req.params.userId) == req.session.loggedInUser._id) {
        res.redirect('/');
    }
    else {
        let loggedIn = false;
        User.findById(req.params["userId"]).populate({
            path: 'reviews',
            populate: { path: 'movie' }
        }).populate("watchlist").populate("usersFollowing").populate("usersFollowedBy").populate("personsFollowing").exec(function (err, currentUser) {
            if (err) {
                console.error(err);
                res.status(500).send("Error reading database.");
                return;
            }
            currentUser.dateAccountCreated = new Date(currentUser.dateAccountCreated);
            if (currentUser) {
                User.findOne({ _id: req.session.loggedInUser._id, usersFollowing: currentUser._id }).exec(function (err, loggedUser) {
                    if (err) {
                        console.error(err);
                        res.status(500).send("Error reading database.");
                        return;
                    }
                    currentUser.followed = !!loggedUser;
                    res.send(pug.renderFile('./templates/profileTemplate.pug', { currentUser, loggedIn, contributing }));
                });
            }
            else {
                next();
            }
        });
    }

});

app.put(['/users/:userId/follow'], (req, res) => {
    if (mongoose.Types.ObjectId(req.params.userId) == req.session.loggedInUser._id) {
        res.status(400).send(JSON.stringify({ status: "400", error: "You can't follow yourself." }));
    }
    else {
        User.findById(req.params["userId"]).exec(function (err, userToFollow) {
            if (err) {
                console.error(err);
                return;
            }
            if (userToFollow) {
                User.findOne({ _id: req.session.loggedInUser._id, usersFollowing: userToFollow._id }).exec(function (err, userRes) {
                    if (err) {
                        console.error(err);
                        res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                        return;
                    }
                    else {
                        if (userRes) {
                            res.status(400).send(JSON.stringify({ status: "400", error: "You are already following this user." }));
                        }
                        else {
                            User.updateOne({ _id: req.session.loggedInUser._id }, { $push: { usersFollowing: userToFollow._id } }).then(function (result) {
                                User.updateOne({ _id: userToFollow._id }, { $push: { usersFollowedBy: req.session.loggedInUser._id } }).then(function (results) {
                                    res.status(200).send(JSON.stringify({ status: "200" }));
                                }).catch(function (err) {
                                    console.error(err);
                                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                                    return;
                                });
                            }).catch(function (err) {
                                console.error(err);
                                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                                return;
                            });
                        }
                    }
                });
            }
            else {
                res.status(400).send(JSON.stringify({ status: "400", error: "That user id is invalid." }));
            }
        });
    }

});

app.put(['/users/:userId/unfollow'], (req, res) => {
    if (mongoose.Types.ObjectId(req.params.userId) == req.session.loggedInUser._id) {
        res.status(400).send(JSON.stringify({ status: "400", error: "You can't unfollow yourself." }));
    }
    else {
        User.findById(req.params["userId"]).exec(function (err, userToFollow) {
            if (err) {
                console.error(err);
                return;
            }
            if (userToFollow) {
                User.findOne({ _id: req.session.loggedInUser._id, usersFollowing: userToFollow._id }).exec(function (err, userRes) {
                    if (err) {
                        console.error(err);
                        res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                        return;
                    }
                    else {
                        if (!userRes) {
                            res.status(400).send(JSON.stringify({ status: "400", error: "You are not following this user." }));
                        }
                        else {
                            User.updateOne({ _id: req.session.loggedInUser._id }, { $pull: { usersFollowing: userToFollow._id } }).then(function (result) {
                                User.updateOne({ _id: userToFollow._id }, { $pull: { usersFollowedBy: req.session.loggedInUser._id } }).then(function (results) {
                                    res.status(200).send(JSON.stringify({ status: "200" }));
                                }).catch(function (err) {
                                    console.error(err);
                                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                                    return;
                                });
                            }).catch(function (err) {
                                console.error(err);
                                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                                return;
                            });
                        }
                    }
                });
            }
            else {
                res.status(400).send(JSON.stringify({ status: "400", error: "That user id is invalid." }));
            }
        });
    }
});

let movieSearch = (req, res, cond) => {
    if (req.query.title && req.query.title.trim() != '') {
        cond.title = { $regex: `.*${req.query.title}.*`, $options: 'i' };
    }
    if (req.query.genre && req.query.genre.trim() != '') {
        cond.genre = { $regex: `.*${req.query.genre}.*`, $options: 'i' };
    }
    Movie.find(cond, function (err, movieData) {
        if (err) {
            console.log(err);
            res.status(500).send("Error reading database.");
            return;
        }
        res.status(200).send(pug.renderFile('./templates/moviesTemplate.pug', { movieData, contributing }));
    });
}


app.get(['/movies'], async (req, res) => {
    if (req.query && Object.keys(req.query).length > 0) {
        let cond = {};
        if (req.query.actor && req.query.actor.trim() != '') {
            Person.find({
                name: { $regex: `.*${req.query.actor.trim()}.*`, $options:'i'}
            }, function (err, personsResults) {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error reading database.");
                    return;
                }
                let persons = personsResults.map(function (person) {
                    return person._id;
                });
                cond.actor = { $in: persons };
                movieSearch(req, res, cond);
            });
        }
        else {
            movieSearch(req, res, cond);
        }
    }
    else {
        res.send(pug.renderFile('./templates/movieSearchTemplate.pug', { contributing }));
    }
});

app.post(['/movies'], async function (req, res) {
    if(!contributing){
        res.status(403).send(JSON.stringify({status: "403", error: "Unauthorized: You must be a contributing user to add a movie."}));
        return;
    }
    if(!req.body.title || req.body.title == "" || !req.body.year || isNaN(req.body.year) || parseInt(req.body.year) < 0){
        res.status(400).send(JSON.stringify({status: "400", error: "Bad request: Invalid fields."}));
        return;
    }
    let invalid = false;
    let movie = new Movie();
    movie.title = req.body.title;
    movie.year = req.body.year;
    movie.runtime = req.body.runtime;
    movie.plot = req.body.plot;
    if(req.body.genres && req.body.genres.length > 0){
        movie.genre = req.body.genres;
    }
    else{
        movie.genre = ["N/A"];
    }
    if(req.body.actor && req.body.actor.length > 0){
        for(a of req.body.actor){
            await Person.findOne({_id:a}).then(function(result){
                if(!result){
                    res.status(400).send(JSON.stringify({status:"400", error:"Bad request: Invalid actor id."}));
                    invalid = true;
                    return;
                }
            }).catch(function(err){
                console.error(err);
                res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                invalid = true;
                return;
            });
        }
        if(!invalid)
            movie.actor = req.body.actor;
    }
    else if(!invalid){
        await Person.findOne({name: "N/A"}).then(async function(result){
            if(!result){
                let p = new Person();
                p.name = "N/A";
                await Person.create(p).then(function(cResult){
                    movie.actor = [cResult._id];
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                    invalid = true;
                    return;
                });
            }
            else{
                movie.actor = [result._id];
            }
        }).catch(function(err){
            console.error(err);
            res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
            invalid = true;
            return;
        })
    }
    if(!invalid && req.body.director && req.body.director.length > 0){
        for(a of req.body.director){
            await Person.findOne({_id:a}).then(function(result){
                if(!result){
                    res.status(400).send(JSON.stringify({status:"400", error:"Bad request: Invalid actor id."}));
                    invalid = true;
                    return;
                }
            }).catch(function(err){
                console.error(err);
                res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                invalid = true;
                return;
            });
        }
        movie.director = req.body.director;
    }
    else if(!invalid){
        await Person.findOne({name: "N/A"}).then(async function(result){
            if(!result){
                let p = new Person();
                p.name = "N/A";
                await Person.create(p).then(function( cResult){
                    movie.director = [cResult._id];
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                    invalid = true;
                    return;
                })
            }
            else{
                movie.director = [result._id];
            }
        }).catch(function(err){
            console.error(err);
            res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
            invalid = true;
            return;
        })
    }

    if(!invalid && req.body.writer && req.body.writer.length > 0){
        for(a of req.body.writer){
            await Person.findOne({_id:a}).then(function(result){
                if(!result){
                    res.status(400).send(JSON.stringify({status:"400", error:"Bad request: Invalid actor id."}));
                    return;
                }
            }).catch(function(err){
                console.error(err);
                res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                invalid = true;
                return;
            });
        }
        movie.writer = req.body.writer;
    }
    else if(!invalid){
        await Person.findOne({name: "N/A"}).then(async function(result){
            if(!result){
                let p = new Person();
                p.name = "N/A";
                await Person.create(p).then(function(cResult){
                    movie.writer = [cResult._id];
                }).catch(function(err){
                    console.error(err);
                    res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
                    invalid = true;
                    return;
                })
            }
            else{
                movie.writer = [result._id];
            }
        })
    }
    if(!invalid){
        await Movie.create(movie).then(function(result){
            // combine into one persons array and remove duplicates
            let persons = [];
            let temp = result.actor;
            temp = temp.concat(result.writer, result.director)
            temp.forEach(p=>{
                if(persons.indexOf(`${p}`) == -1){
                    persons.push(`${p}`);
                }
            })
            generateNotifications(res, "Person", result, persons);
        }).catch(function(err){
            console.error(err);
            res.status(500).send(JSON.stringify({status: "500", error: "Error writing movie to database."}));
            return;
        });
    }
})

app.post(['/movies/:movieId/reviews'], function (req, res) {
    if (!contributing) {
        res.status(403).send(JSON.stringify({status: "403", error: "Unauthorized: You must be a contributing user to add a review"}));
        return;
    }
    let review = new Review();
    review.reviewDate = Date.now();
    review.rating = req.body.rating;
    review.reviewSummary = req.body.summary;
    review.fullReview = req.body.fullReview;
    review.reviewer = req.session.loggedInUser._id;
    review.movie = req.params.movieId;
    Review.create(review).then(function (result) {
        Movie.updateOne({ _id: req.params.movieId }, { $push: { reviews: result._id } }).then(function (movieRes) {
            User.updateOne({ _id: req.session.loggedInUser._id }, { $push: { reviews: result._id } }).then(async function (userRes) {
                await generateNotifications(res, "User", req.params.movieId, req.session.loggedInUser);
            }).catch(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                    return;
                }
            });
        }).catch(function (err) {
            if (err) {
                console.error(err);
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            }
        });
    })
        .catch(function (err) {
            if (err) {
                console.error(err);
                res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                return;
            }
        })
});

app.get(['/movies/add'], async (req, res) => {
    if(!contributing){
        res.status(403).send("Unauthorized: You can't access this page as a non-contributing user.");
    }
    else {
        res.send(pug.renderFile('./templates/movieCreationTemplate.pug', { contributing }));
    }
});

app.get(['/movies/:movieId'], (req, res, next) => {
    Movie.findById(req.params["movieId"]).populate({
        path: 'reviews',
        populate: { path: 'reviewer' }
    }).populate('actor').populate('writer').populate('director').exec(async function (err, movie) {
        if (err) {
            console.error(err);
            return;
        }
        if (movie) {
            if (movie.reviews.length > 0) {
                if (movie.reviews.length > 1)
                    movie.averageRating = movie.reviews.reduce((rev, rev2) => (rev.rating + rev2.rating)) / movie.reviews.length;
                else
                    movie.averageRating = movie.reviews[0].rating;
            }
            else {
                movie.averageRating = "N/A";
            }

            await User.findOne({ _id: req.session.loggedInUser._id, watchlist: movie._id }, function (err, user) {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error reading database");
                    return;
                }
                movie.watched = !!user;
            });

            // find similar movies, which are simply 5 movies with the top genre
            Movie.find({_id: {$ne: movie._id}, genre: movie.genre[0]}, function(err, results){
                if (err) {
                    console.error(err);
                    res.status(500).send("Error reading database");
                    return;
                }
                if(results.length > 5){
                    movie.similarMovies = results.slice(0, 5);
                }
                else{
                    movie.similarMovies = results;
                }
                res.send(pug.renderFile('./templates/movieTemplate.pug', { movie, contributing }));
            });
        }
        else {
            res.status(404).send('Movie not found!');
        }
    });

});

app.put(['/movies/:movieId/watch'], (req, res) => {
    Movie.findById(req.params.movieId, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
            return;
        }
        if (!result) {
            res.status(400).send(JSON.stringify({ status: "400", error: "Invalid movie id." }));
        }
        else {
            User.findOne({ _id: req.session.loggedInUser._id, watchlist: result._id }, function (err, user) {
                if (user) {
                    res.status(400).send(JSON.stringify({ status: "400", error: "This movie is already in your watchlist." }));
                }
                else {
                    User.updateOne({ _id: req.session.loggedInUser._id }, { $push: { watchlist: result._id } }).then(function (userRes) {
                        res.status(200).send(JSON.stringify({ status: "200" }));
                    }).catch(function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                            return;
                        }
                    });
                }
            });
        }
    })
});

app.put(['/movies/:movieId/unwatch'], (req, res) => {
    Movie.findById(req.params.movieId, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
            return;
        }
        if (!result) {
            res.status(400).send(JSON.stringify({ status: "400", error: "Invalid movie id." }));
        }
        else {
            User.findOne({ _id: req.session.loggedInUser._id, watchlist: result._id }, function (err, user) {
                if (!user) {
                    res.status(400).send(JSON.stringify({ status: "400", error: "This movie is not in your watchlist." }));
                }
                else {
                    User.updateOne({ _id: req.session.loggedInUser._id }, { $pull: { watchlist: result._id } }).then(function (userRes) {
                        res.status(200).send(JSON.stringify({ status: "200" }));
                    }).catch(function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                            return;
                        }
                    });
                }
            });
        }
    })
});

app.get('/persons', function(req, res){
    let cond = {};
    if(req.query.name)
        cond.name = { $regex: `.*${req.query.name}.*`, $options: 'i' }
    Person.find(cond).exec(function(err, results){
        if(err){
            console.error(err);
            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
            return;
        }
        res.status(200).send(results);
    });
});

app.get('/persons/add', function(req, res){
    if(!contributing){
        res.status(403).send("Unauthorized: You must be a contributing user to access this.");
    }
    else{
        res.status(200).send(pug.renderFile('./templates/personCreationTemplate.pug', {contributing}));
    }
});

app.post('/persons', function(req, res){
    if(!contributing){
        res.status(403).send(JSON.stringify({status: "403", error:"Unauthorized: You must be a contributing user to add a person."}));
    }
    else{
        let person = new Person();
        person.name = req.body.name;
        Person.create(person, function(err, result){
            if(err){
                console.error(err);
                res.status(500).send(JSON.stringify({status: "500", error:"An error occured. Possible duplicate: Please ensure the person's name is unique."}));
                return;
            }
            else{
                res.status(201).send(JSON.stringify({status: "201"}));
            }
        });
    }
});

app.get(['/persons/:personId'], (req, res, next) => {
    Person.findById(req.params.personId).populate("actor").populate("writer").populate("director").exec(function (err, person) {
        if (err) {
            console.error(err);
            return;
        }
        if (person) {
            User.findOne({_id:req.session.loggedInUser._id, personsFollowing: person._id}).exec(function(err, result){
                if(err){
                    console.error(err);
                    res.status(500).send("Error reading database");
                    return;
                }
                let following = !!result;
                res.send(pug.renderFile('./templates/personTemplate.pug', { person, contributing, following }));
            });
        }
        else {
            next();
        }
    })
});

app.put(['/persons/:personId/follow'], (req, res) => {
    Person.findById(req.params.personId, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
            return;
        }
        if (!result) {
            res.status(400).send(JSON.stringify({ status: "400", error: "Invalid person id." }));
        }
        else {
            User.findOne({ _id: req.session.loggedInUser._id, personsFollowing: result._id }, function (err, user) {
                if (user) {
                    res.status(400).send(JSON.stringify({ status: "400", error: "You are already following this person." }));
                }
                else {
                    User.updateOne({ _id: req.session.loggedInUser._id }, { $push: { personsFollowing: result._id } }).then(function (userRes) {
                        res.status(200).send(JSON.stringify({ status: "200" }));
                    }).catch(function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                            return;
                        }
                    });
                }
            });
        }
    })
});

app.put(['/persons/:personId/unfollow'], (req, res) => {
    Person.findById(req.params.personId, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
            return;
        }
        if (!result) {
            res.status(400).send(JSON.stringify({ status: "400", error: "Invalid person id." }));
        }
        else {
            User.findOne({ _id: req.session.loggedInUser._id, personsFollowing: result._id }, function (err, user) {
                if (!user) {
                    res.status(400).send(JSON.stringify({ status: "400", error: "You are currently not following this person" }));
                }
                else {
                    User.updateOne({ _id: req.session.loggedInUser._id }, { $pull: { personsFollowing: result._id } }).then(function (userRes) {
                        res.status(200).send(JSON.stringify({ status: "200" }));
                    }).catch(function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(JSON.stringify({ status: "500", error: "Error reading database." }));
                            return;
                        }
                    });
                }
            });
        }
    })
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.use(function (req, res, next) {
    res.status(404).send(JSON.stringify({status: "404", error:"Sorry, we couldn't find that resource!"}));
});

mongoose.connect('mongodb://localhost/moviedata', { useNewUrlParser: true });

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
});