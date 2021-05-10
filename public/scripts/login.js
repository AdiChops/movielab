let place = `${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById('login-button').addEventListener('click', ()=>{
    console.log(location.hostname);
    let usernameV = document.getElementById('username').value;
    let passwordV = document.getElementById('password').value;
    if(!usernameV || !passwordV || usernameV == "" || passwordV == ""){
        document.getElementById("error").style.display = "block";
    }
    else{
        document.getElementById("error").style.display = "none";
        let user = {
            username: usernameV,
            password: passwordV
        };
        fetch(`http://${place}/login`, {
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