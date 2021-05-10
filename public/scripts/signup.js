let place = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById('signup-button').addEventListener('click', ()=>{
    let usernameV = document.getElementById('username').value;
    let passwordV = document.getElementById('password').value;
    if(!usernameV || !passwordV || usernameV == "" || passwordV == ""){
        document.getElementById("error").style.display = "block";
    }
    else{
        document.getElementById("error").style.display = "none";
        let user = {
            username: usernameV,
            password: passwordV,
            contributingUser: document.getElementById("contributing").checked
        };
        fetch(`${place}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then((response)=>{
            return response.json();
        }).then((data)=>{
            console.log(data);
            if(data.status != 200){
                document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
                document.getElementById("error").style.display = "block";
            }
            else{
                location.href="/";
            }
        });
    }
});