let $$ = (id) =>{
    return document.getElementById(id);
};
addEventListener('load',()=>{
    
    fetch("../data/user.json").then((resp)=>{
        return resp.json();
    }).then((resp)=>{
        let currentUser = resp;
        let reviews = currentUser["reviews"];
        $$("user_info").innerHTML = `
            <h2>${currentUser["username"]}</h2>
            <p>Member since ${currentUser["dateAccountCreated"].substr(0, 4)}</p>
            <p>${(currentUser["contributingUser"]=="true")?"Contributing User":"Non-contributing User"}</p>
            <p>Wrote ${(reviews==null)?"no": reviews.length} reviews</p>
            <button>Followed by ${currentUser["usersFollowedBy"].length} User${(currentUser["usersFollowedBy"].length > 1 || currentUser["usersFollowing"].length == 0)?"s":""}</button>
            <button>Following ${currentUser["usersFollowing"].length} User${(currentUser["usersFollowing"].length > 1 || currentUser["usersFollowing"].length == 0)?"s":""}</button>
            <button>Following ${currentUser["peopleFollowing"].length} ${(currentUser["usersFollowing"].length > 1 || currentUser["usersFollowing"].length == 0)?"People":"Person"}</button>
        `;
    });
});