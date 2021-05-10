let place = `${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById('addPerson').addEventListener('click', ()=>{
    let nameV = document.getElementById('name').value.trim();
    if(!nameV || nameV == "" ){
        document.getElementById("error").style.display = "block";
    }
    else{
        document.getElementById("error").style.display = "none";
        let person = {
            name: nameV
        };
        fetch(`http://${place}/persons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(person)
        }).then((response)=>{
            return response.json();
        }).then((data)=>{
            console.log(data);
            if(data.status != 201){
                document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
                document.getElementById("error").style.display = "block";
            }
            else{
                alert("Person added!");
                document.getElementById('addPerson').value = "";
            }
        });
    }
});