let genres = [];
let directors = [];
let writers = [];
let actors = [];

let movie = {};

document.getElementById('submit-button').addEventListener('click', submitMovie);
document.getElementById('add-genre').addEventListener('click', addGenre);
document.getElementById('add-director').addEventListener('click', addDirector);
document.getElementById('add-writer').addEventListener('click', addWriter);
document.getElementById('add-actor').addEventListener('click', addActor);

function addGenre(){
    
    let genre = document.getElementById('genre').value;
    if(genre != ""){
        genres.push(genre);
    }
    
}

function addDirector(){
    
    let director = document.getElementById('director').value;
    if(director != ""){
        directors.push(director);
    }
    
}

function addWriter(){
    
    let writer = document.getElementById('director').value;
    if(writer != ""){
        writers.push(writer);
    }
    
}

function addActor(){
    
    actor = document.getElementById('actor').value;
    if(actor != ""){
        actors.push(actor);
    }
    
}


function submitMovie(){
    let m = new Movie();
    movie.Title = document.getElementById('title').value;
    movie.Director = directors;
    movie.Writer = writers;
    movie.Genre = genres;
    movie.Actors = actors;
    movie.Plot = document.getElementById('plot').value;
    movie.ReleaseDate = document.getElementById('releaseDate').value;
    movie.Runtime = document.getElementById('runtime').value;
    movie.Awards = document.getElementById('awards').value;
    movie.Poster = document.getElementById('poster').value;
    movie.Year = document.getElementById('year').value;
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==201){
            alert("movie submitted");
        }
        req.open("POST", "/movies");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(movie));
    }
}

function getAllPersons(){
    
}