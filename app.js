const express = require('express');
const session = require('express-session');
const pug = require('pug');
const mongoose = require('mongoose');
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const User = require("./models/UserModel");

const movieData = require('./data/movies.json');
const reviewData = require('./data/reviews.json');
const userData = require('./data/users.json');
const personData = require('./data/persons.json');
const feedData = require('./data/feedPosts.json');
const notifData = require('./data/notifications.json');
const app = express();
const port = 3000;
let movies = {};
let users = {};
let persons = {};
let userFeed = {};
let notifications = {};
let reviews = {};

movieData.forEach(movie => {
	movies[movie["id"]] = movie.info;
});

userData.forEach(user => {
	users[user["id"]] = user.info;
});

personData.forEach(person => {
    persons[person["id"]] = person;
});

feedData.forEach(post=>{
    userFeed[post["id"]] = post.info;
});

notifData.forEach(not=>{
    notifications[not["id"]] = not.info;
});

reviewData.forEach(r=>{
    reviews[r["id"]] = r;
});

let getMessage = (post) =>{
        switch(post["postType"]){
            case "review":{
                return `${users[post["subjectId"]]["username"]} reviewed ${movies[post["subjectMovieId"]]["Title"]}`;
            }
            case "starring":{
                `${movies[post["subjectMovieId"]]["Title"]} was added, and it stars ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`
            }
            case "directing":{
                return `${movies[post["subjectMovieId"]]["Title"]} was added, directed by ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`;
            }
        }
};

let getNotif = (n) =>{
    switch(n["notifType"]){
        case "review":{
            return `New review by ${users[n["subjectId"]]["username"]}`;
        }
        case "starring":{
            `New movie starring ${persons[n["subjectId"]]["firstName"]} ${persons[n["subjectId"]]["lastName"]}`
        }
        case "directing":{
            return `New movie directed by ${persons[n["subjectId"]]["firstName"]} ${persons[n["subjectId"]]["lastName"]}`;
        }
    }
}

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({secret: 'safe session'}));

app.get('/login', (req,res)=>{
    res.sendFile('login.html', {root: './public'});
});

app.post('/login', (req, res)=>{
    console.log(req.body);
    User.findOne(req.body, function(err, userData){
        if(err){
            res.status(500).send(JSON.stringify({status: "500", error: "Error reading database."}));
            return;
        }
        if(userData && Object.keys(userData).length > 0){
            req.session.loggedIn = true;
            req.session.loggedInUser = userData;
            res.status(200).send(JSON.stringify({status: "200"}));
        }
        else{
            res.status(403).send(JSON.stringify({status: "403", error: "Invalid username/password."}));
        }
    });
});

let auth = (req, res, next)=>{
    if(!req.session.loggedIn){
        res.status(401).redirect('/login');
        return;
    }
    next();
};


app.get('/signup', (req,res)=>{
    res.sendFile('signup.html', {root: './public'});
});


// from hereon, ensure that user is authenticated
app.use(auth);

/*
app.get('/createMovie', (req,res)=>{
    res.sendFile('createMovie.html', {root: './public'});
});

app.get('/createPerson', (req,res)=>{
    res.sendFile('createPerson.html', {root: './public'});
});

app.get('/advancedSearch', (req,res)=>{
    res.sendFile('advancedSearch.html', {root: './public'});
});
*/

app.get(['/', '/index'], (req,res)=>{
    let loggedIn = true;
    currentUser = req.session.loggedInUser;
    currentUser.dateAccountCreated = new Date(currentUser.dateAccountCreated);
    console.log(currentUser);
    res.send(pug.renderFile('./templates/profileTemplate.pug', {currentUser, loggedIn}));
});

app.get(['/users/:userId'], (req, res, next)=>{
    let id = req.params["userId"];
    let loggedIn = false;
    currentUser = users[id];
    currentUser.dateAccountCreated = new Date(currentUser.dateAccountCreated);
    if(currentUser != undefined){
        console.log(currentUser);
        res.send(pug.renderFile('./templates/profileTemplate.pug', {currentUser, loggedIn}));
    }
    else{
       next();
    }

});

app.get(['/index/feed'], (req,res)=>{
    let feedPosts = currentUser["feedPosts"];
    let feed = {};
    let post = {};
    for(let i of feedPosts){
        post = userFeed[i];
        let d = new Date(post["date"]);
        feed[i] = {message: getMessage(post), date: d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()};
    }
    feed = Object.fromEntries(Object.entries(feed).sort(([k1, v1], [k2, v2])=>{
        return v1.date < v2.date;
    }));
    res.send(feed);
});

app.get(['/index/notifications'], (req,res)=>{
    let notifs = currentUser["notifications"];
    let not = {};
    let n = {};
    for(let i of notifs){
        n = notifications[i];
        let d = new Date(n["date"]);
        not[i] = {message: getNotif(n), timeAgo: Math.floor((new Date() - d)/(1000*60*60*24)) + "d ago", read: n.read, date: d};
    }
    not = Object.fromEntries(Object.entries(not).sort(([k1, v1], [k2, v2])=>{
        return v1.date < v2.date;
    }));
    console.log(not);
    res.send(not);
});

app.get(['/movies'], (req, res) => {
    if(req.query && Object.keys(req.query).length > 0){
        let cond = {};
        if(req.query.title){
            cond.title = {$regex: `.*${req.query.title}.*`, $options: 'i'};
        }
        if(req.query.genres){
            cond.genre = {$regex: `.*${req.query.genre}.*`, $options: 'i'};
        }
        if(req.query.actor){
            cond.actor = mongoose.Types.ObjectId(req.query.actor);
        }
        console.log(cond);
        Movie.find(cond, function(err, movieData){
            if(err){
                console.log(err);
                res.status(500).send("Error reading database.");
                return;
            }
            console.log(movieData);
            res.status(200).send(pug.renderFile('./templates/moviesTemplate.pug', {movieData}));
        })
    }
    else{
        res.send(pug.renderFile('./templates/movieSearchTemplate.pug'));
    }
});

app.get(['/movies/:movieId'], (req,res, next)=>{
    let id = req.params["movieId"];
    let movie;
    
    console.log(id);
    movie = movies[id];
    console.log(movie);
    if(movie != undefined){
        res.send(pug.renderFile('./templates/movieTemplate.pug', {movie, movies, persons, reviews, users}));
    }
    else{
       next();
    }

});

app.get(['/persons'], (req, res) => {
    res.send(pug.renderFile('./templates/personsTemplate.pug', {personData}));
});

app.get('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/login');
});

app.get(['/persons/:personId'], (req, res, next)=> {
    let id = req.params["personId"];
    let person = persons[id];
    if (person != undefined){
        res.send(pug.renderFile('./templates/personTemplate.pug', {person, persons, movies}));
    }
    else{
        next();
    }
});

app.post(['/movies'], function(req, res){
    console.log(req.body);
    res.send('POST request to the database')

})

app.use(function (req, res, next) {
    res.status(404).send("Sorry, we couldn't find that resource!");
});

mongoose.connect('mongodb://localhost/moviedata', {useNewUrlParser: true});

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    app.listen(port, ()=>{
        console.log(`Server listening at http://localhost:${port}`);
    });
});