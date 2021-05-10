let personId = document.getElementById("personId").value;
let place = `${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById("follow").addEventListener("click", ()=>{
    fetch(`http://${place}/persons/${personId}/follow`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        if(data.status != 200){
            document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
            document.getElementById("error").style.display = "block";
        }
        else{
            document.getElementById("error").style.display = "none";
            document.getElementById("follow").style.display = "none";
            document.getElementById("unfollow").style.display = "block";
        }
    });
});

document.getElementById("unfollow").addEventListener("click", ()=>{
    fetch(`http://${place}/persons/${personId}/unfollow`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        if(data.status != 200){
            document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
            document.getElementById("error").style.display = "block";
        }
        else{
            document.getElementById("error").style.display = "none";
            document.getElementById("unfollow").style.display = "none";
            document.getElementById("follow").style.display = "block";
        }
    });
});