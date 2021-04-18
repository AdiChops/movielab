let movId = document.getElementById("movieId").value;
document.getElementById("watch").addEventListener("click", ()=>{
    fetch(`http://localhost:3000/movies/${movId}/watch`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        if(data.status != 200){
            document.getElementById("errorWatch").innerHTML = `<span>&times;</span> ${data.error}`;
            document.getElementById("errorWatch").style.display = "block";
        }
        else{
            document.getElementById("unwatch").style.display = "block";
            document.getElementById("watch").style.display = "none";
            document.getElementById("errorWatch").style.display = "none";
        }
    });
});

document.getElementById("unwatch").addEventListener("click", ()=>{
    fetch(`http://localhost:3000/movies/${movId}/unwatch`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        if(data.status != 200){
            document.getElementById("errorWatch").innerHTML = `<span>&times;</span> ${data.error}`;
            document.getElementById("errorWatch").style.display = "block";
        }
        else{
            document.getElementById("unwatch").style.display = "none";
            document.getElementById("watch").style.display = "block";
            document.getElementById("errorWatch").style.display = "none";
        }
    });
});