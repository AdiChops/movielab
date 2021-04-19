let loadFeedAndNotifs = ()=>{

    fetch('http://localhost:3000/index/notifications').
    then((resp)=>{
        return resp.json();
    }).then((data)=>{
        if(data.status == 200){
            document.getElementById('notifs').innerHTML = "";
            console.log(data.data);
            for(let i in data.data){
                document.getElementById('notifs').innerHTML += `<li><a class="dropdown-item" href="/movies/${data.data[i].notification.movie}">${data.data[i].notification.notificationText} <span class="ago">${Math.floor((Date.now() -  new Date(data.data[i].notification.date)) / (1000 * 60 * 60 * 24))}d ago</span></a></li>`;
                let c = "left";
                if(i%2!=0){
                    c = "right";
                }
                // code snippet inspired from W3Schools: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_timeline
                document.getElementById('timelineDiv').innerHTML += `<div class="subtime ${c}">
                    <div class="content">
                        <h3>${new Intl.DateTimeFormat('en-CA', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(data.data[i].notification.date))}</h3>
                        <a href="/movies/${data.data[i].notification.movie}">${data.data[i].notification.notificationText}</p>
                    </div>
                </div>`;
                // end of code snippet
            }
        }
    }).catch((error)=>{
        console.error('Error:', error);
    });
};

addEventListener('load',()=>{
    loadFeedAndNotifs();
});

document.getElementById("switch-account").addEventListener('click', ()=>{
    fetch(`http://localhost:3000/users/switchType`, {
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