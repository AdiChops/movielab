let movie = {
    "director":[],
    "writer":[],
    "actor":[],
    "genres": []
}

let containsGenre = (genre)=>{
    let regex = new RegExp(movie["genres"].join('|'), "i");
    return regex.test(genre);
};

let genreDiv = document.getElementById('genre-list');
document.getElementById('add-genre').addEventListener('click', ()=>{
    let genre = document.getElementById('genre').value.trim();
    if(genre != ""){
        document.getElementById('genre').value = ""; 
        if(movie["genres"].length == 0 ||!containsGenre(genre)){
            movie["genres"].push(genre);
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
                    if(!movie[personType].includes(para.id)){
                        document.getElementById(`${personType}-list`).innerHTML+=`<p>${para.textContent}</p>`;
                        movie[personType].push(para.id);
                    }
                });
                document.getElementById(`${personType}-dropdown`).appendChild(para);
            }
        }).catch((err)=>{
            console.error(err);
        });
}

document.getElementById('director').addEventListener('keyup', (e)=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('director').value.trim().length > 0){
        if(e.key == 'Enter') // only update results if enter key was pressed
            personSearch('director');
    }
});

document.getElementById('writer').addEventListener('keyup', (e)=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('writer').value.trim().length > 0){
        if(e.key == 'Enter') // only update results if enter key was pressend
            personSearch('writer');
    }
});

document.getElementById('actor').addEventListener('keyup', (e)=>{
    // only search once there is at least 1 characters typed
    if(document.getElementById('actor').value.trim().length > 0){
        if(e.key == 'Enter') // only update results if enter key was pressed
            personSearch('actor');
    }
});

document.getElementById('addMovie').addEventListener('click', ()=>{
    let errorP = document.getElementById("error");
    let title = document.getElementById("title").value.trim();
    let year = document.getElementById("year").value.trim();
    if(title == "" || year == ""){
        errorP.style.display = "block";
    }
    else if(isNaN(year) || parseInt(year) < 0){
        errorP.innerHTML = "<span>&times;</span> Year must be a number greater than 0";
        errorP.style.display = "block";
    }
    else{
        let plot = document.getElementById('plot').value.trim();
        let runtime = document.getElementById('runtime').value.trim();
        if(runtime != "" && (isNaN(runtime) || parseInt(runtime) < 0)){
            errorP.innerHTML = "<span>&times;</span> Runtime must be a number greater than 0";
            errorP.style.display = "block"; 
        }
        else{
            errorP.style.display = "none";
            if(runtime == ""){
                movie.runtime = "N/A";
            }
            else{
                movie.runtime = `${runtime} min`;
            }
            if(plot == "")
                plot = "N/A";

            movie.title = title;
            movie.year = year;
            movie.plot = plot;

            fetch(`http://localhost:3000/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movie)
            }).then((response)=>{
                return response.json();
            }).then((data)=>{
                console.log(data);
                if(data.status != 201){
                    document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
                    document.getElementById("error").style.display = "block";
                }
                else{
                    window.alert("Movie added!");
                    location.href = `/movies/${data.movie._id}`;
                }
            });

        }
    }
});