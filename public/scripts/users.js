let userId = document.getElementById("userId").value;
let place = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById("follow").addEventListener("click", ()=>{
    fetch(`${place}/users/${userId}/follow`, {
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
            location.reload();
        }
    });
});

document.getElementById("unfollow").addEventListener("click", ()=>{
    fetch(`${place}/users/${userId}/unfollow`, {
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
            location.reload();
        }
    });
});