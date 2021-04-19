let genres = [];
let directors = [];
let writers = [];
let actors = [];

let persons = {
    "director":[],
    "writer":[],
    "actor":[]
}

let containsGenre = (genre)=>{
    let regex = new RegExp(genres.join('|'), "i");
    return regex.test(genre);
};

let genreDiv = document.getElementById('genre-list');
document.getElementById('add-genre').addEventListener('click', ()=>{
    let genre = document.getElementById('genre').value.trim();
    if(genre != ""){
        document.getElementById('genre').value = ""; 
        if(genres.length == 0 ||!containsGenre(genre)){
            genres.push(genre);
            genreDiv.innerHTML += `<p>${genre}</p>`;
        }
    }
});

let personSearch = (personType)=>{
    fetch(`http://localhost:3000/persons?name=${document.getElementById(personType).value.trim()}`).then((response)=>{
            return response.json();
        }).then((data)=>{
            document.getElementById(`${personType}-dropdown`).innerHTML = '';
            for(let d of data){
                let para = document.createElement("p");
                para.id = d._id;
                para.textContent = d.name;
                para.classList.add('dropdown-item');
                para.addEventListener('click', ()=>{
                    document.getElementById(personType).value = "";
                    document.getElementById(`${personType}-dropdown`).innerHTML = '';
                    if(!persons[personType].includes(para.id)){
                        document.getElementById(`${personType}-list`).innerHTML+=`<p>${para.textContent}</p>`;
                        persons[personType].push(para.id);
                    }
                });
                document.getElementById(`${personType}-dropdown`).appendChild(para);
            }
        }).catch((err)=>{
            console.error(err);
        });
}

document.getElementById('director').addEventListener('keyup', ()=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('director').value.trim().length > 0){
        personSearch('director');
    }
});

document.getElementById('writer').addEventListener('keyup', ()=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('writer').value.trim().length > 0){
        personSearch('writer');
    }
});

document.getElementById('actor').addEventListener('keyup', ()=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('actor').value.trim().length > 0){
        personSearch('actor');
    }
});

document.getElementById('addMovie').addEventListener('click', ()=>{
    
});



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