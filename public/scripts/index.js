let loadFeedAndNotifs = ()=>{
    fetch('http://localhost:3000/index/feed').
        then((resp)=>{
            return resp.json();
        }).then((feedPosts)=>{
            document.getElementById('timelineDiv').innerHTML = "";
            for(let i in feedPosts){
                let c = "left";
                if(i%2!=0){
                    c = "right";
                }
                // code snippet inspired from W3Schools: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_timeline
                document.getElementById('timelineDiv').innerHTML += `<div class="subtime ${c}">
                    <div class="content">
                        <h3>${feedPosts[i].date}</h3>
                        <p>${feedPosts[i].message}</p>
                    </div>
                </div>`;
                // end of code snippet
            }
        }).catch((error)=>{
            console.error('Error:', error);
    });

    fetch('http://localhost:3000/index/notifications').
    then((resp)=>{
        return resp.json();
    }).then((notifications)=>{
        document.getElementById('notifs').innerHTML = "";
        for(let i in notifications){
            document.getElementById('notifs').innerHTML += `<li><a class="dropdown-item" href="#">${notifications[i].message} ${notifications[i].timeAgo}</a></li>`;
        }
    }).catch((error)=>{
        console.error('Error:', error);
    });
};

addEventListener('load',()=>{
    loadFeedAndNotifs();
});