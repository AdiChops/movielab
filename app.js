const express = require('express');
const session = require('express-session');
const pug = require('pug');
const mongoose = require('mongoose');
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const User = require("./models/UserModel");
const Review = require("./models/ReviewModel");

const feedData = require('./data/feedPosts.json');
const notifData = require('./data/notifications.json');
const app = express();
const port = 3000;
let movies = {};
let users = {};
let persons = {};
let userFeed = {};
let notifications = {};
let contributing;


feedData.forEach(post => {
    userFeed[post["id"]] = post.info;
});

notifData.forEach(not => {
    notifications[not["id"]] = not.info;
});

let getMessage = (post) => {
    switch (post["postType"]) {
        case "review": {
            return `${users[post["subjectId"]]["username"]} reviewed ${movies[post["subjectMovieId"]]["Title"]}`;
        }
        case "starring": {
            `${movies[post["subjectMovieId"]]["Title"]} was added, and it stars ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`
        }
        case "directing": {
            return `${movies[post["subjectMovieId"]]["Title"]} was added, directed by ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`;
        }
    }
};

let getNotif = (n) => {
    switch (n["notifType"]) {
        case "review": {
            return `New review by ${users[n["subjectId"]]["username"]}`;
        }
        case "starring": {
            `New movie starring ${persons[n["subjectId"]]["firstName"]} ${persons[n["subjectId"]]["lastName"]}`
        }
        case "directing": {
            return `New movie directed by ${persons[n["subjectId"]]["firstName"]} ${persons[n["subjectId"]]["lastName"]}`;
        }
    }
}

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
            res.send(pug.renderFile('./templates/profileTemplate.pug', { currentUser, loggedIn, contributing }));
        }
    );
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


app.get(['/index/feed'], (req, res) => {
    let feedPosts = currentUser["feedPosts"];
    let feed = {};
    let post = {};
    for (let i of feedPosts) {
        post = userFeed[i];
        let d = new Date(post["date"]);
        feed[i] = { message: getMessage(post), date: d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() };
    }
    feed = Object.fromEntries(Object.entries(feed).sort(([k1, v1], [k2, v2]) => {
        return v1.date < v2.date;
    }));
    res.send(feed);
});

app.get(['/index/notifications'], (req, res) => {
    let notifs = currentUser["notifications"];
    let not = {};
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
    res.send(not);
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
                name: { $regex: `.*${req.query.actor}.*` }
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


app.post(['/movies'], function (req, res) {
    console.log(req.body);
    res.send('POST request to the database')

})

app.post(['/movies/:movieId/reviews'], function (req, res) {
    if (!contributing) {
        res.status(403).send("Unauthorized: You must be a contributing user to add a review");
    }
    let review = new Review();
    review.reviewDate = Date.now();
    review.rating = req.body.rating;
    review.reviewSummary = req.body.summary;
    review.fullReview = req.body.fullReview;
    review.reviewer = req.session.loggedInUser._id;
    review.movie = req.params.movieId;
    Review.create(review).then(function (result) {
        Movie.updateOne({ _id: req.params.movieId }, { $push: { reviews: result._id } }).then(function (resulted) {
            User.updateOne({ _id: req.session.loggedInUser._id }, { $push: { reviews: result._id } }).then(function (userRes) {
                res.status(200).send(JSON.stringify({ status: "200" }));
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