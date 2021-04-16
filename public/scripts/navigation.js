let navToggled = false;
let activateNavigation = ()=>{
    navToggled = true;
    if(window.innerWidth > 768){
        document.querySelector('nav').style.width = "25%";
        document.querySelector('main').style.marginLeft = "25%";
        document.querySelector('main').style.width = "auto";
    }
    else{
        document.querySelector('nav').style.width = "100%";
    }
};

let closeNavigation = () => {
    navToggled = false;
    document.querySelector('nav').style.width = "0px";
    document.querySelector('main').style.margin = "auto";

    if(window.innerWidth > 768){
        document.querySelector('main').style.width = "90%";
    }
};

document.getElementById('closebtn').addEventListener('click', ()=>{
    closeNavigation();
});

document.getElementById('hamburger').addEventListener('click', ()=>{
    activateNavigation();
});

window.addEventListener('resize', ()=>{
    if(navToggled){
        activateNavigation();
    }
    else{
        closeNavigation();
    }
});