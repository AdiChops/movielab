const express = require('express');
const pug = require('pug');
const currentUserData = require('./data/loggedInUser.json')
const movieData = require('./data/movies.json')
const userData = require('./data/users.json')
const personData = require('./data/persons.json')
const app = express();
const port = 3000;
let movies = {};
let users = {};
let persons = {};
let currentUser = currentUserData.info;
currentUser.dateAccountCreated = new Date(currentUserData.info.dateAccountCreated);

movieData.forEach(movie => {
	movies[movie["id"]] = movie.info;
});

userData.forEach(user => {
	users[user["id"]] = user.info;
});

personData.forEach(person => {
    persons[person["id"]] = person;
});

let getMessage = (post) =>{
    let messages = {"review": `${users[post["subjectId"]]["username"]} reviewed ${movies[post["subjectMovieId"]]["Title"]}`, "starring":`${movies[post["subjectMovieId"]]["Title"]} was added, and it stars ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`, "directing":`${movies[post["subjectMovieId"]]["Title"]} was added, directed by ${persons[post["subjectId"]]["firstName"]} ${persons[post["subjectId"]]["lastName"]}`};
    return messages[post["postType"]];
};


app.use(express.static('public'));

app.get('/login', (req,res)=>{
    res.sendFile('login.html', {root: './public'});
});

app.get('/createMovie', (req,res)=>{
    res.sendFile('createMovie.html', {root: './public'});
});

app.get('/createPerson', (req,res)=>{
    res.sendFile('createPerson.html', {root: './public'});
});


app.get(['/', '/index'], (req,res)=>{
    res.send(pug.renderFile('./templates/profileTemplate.pug', {currentUser}));
});

app.get(['/index/feed'], (req,res)=>{
    let feedPosts = currentUser["feedPosts"];
    let feed = {};
    for(let i in feedPosts){
        let d = new Date(feedPosts[i]["date"]);
        feed[i] = {message: getMessage(feedPosts[i]), date: d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()};
    }
    feed = Object.fromEntries(Object.entries(feed).sort(([k1, v1], [k2, v2])=>{
        return v1.date < v2.date;
    }));
    res.send(feed);
});

app.get(['/movies'], (req, res) => {
    res.send(pug.renderFile('./templates/moviesTemplate.pug', {movieData}));
});

app.get(['/movies/:movieId'], (req,res, next)=>{
    let id = req.params["movieId"];
    let movie;
    
    console.log(id);
    movie = movies[id];
    console.log(movie);
    if(movie != undefined){
        res.send(pug.renderFile('./templates/movieTemplate.pug', {movie}));
    }
   else{
       next();
   }

});

app.get(['/persons'], (req, res) => {
    res.send(pug.renderFile('./templates/personsTemplate.pug', {personData}));
});

app.get(['/persons/:personId'], (req, res, next)=> {
    let id = req.params["personId"];
    let person = persons[id];
    if (person != undefined){
        res.send(pug.renderFile('./templates/personTemplate.pug', {person}));
    }
    else{
        next();
    }
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry, we couldn't find that resource!");
});

app.listen(port, ()=>{
    console.log(`Server listening at http://localhost:${port}`);
});