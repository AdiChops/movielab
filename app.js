const express = require('express');
const pug = require('pug');
const currentUser = require('./data/user.json')
const app = express();
const port = 3000;
app.use(express.static('public'));

app.get('/login', (req,res)=>{
    res.sendFile('login.html', {root: './public'});
});

app.get(['/', '/index'], (req,res)=>{
    res.send(pug.renderFile('./templates/profileTemplate.pug', {currentUser}));
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

app.listen(port, ()=>{
    console.log(`Example app listening at http://localhost:${port}`);
});