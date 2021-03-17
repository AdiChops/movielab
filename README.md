# COMP 2406 Final Project Check-In
Erica Li and Aaditya Chopra

Winter 2021

## How to run
Go to the project directory on the command line, and enter ```npm install```. Once you have installed the node_modules directory, enter ```npm start``` into your command line, and open http://localhost:3000/ in your web browser. This will open the logged-in user's profile page.

## How to test

**Enter the appropriate URL route into your browser (i.e. http://localhost:3000/movies) to display the corresponding page. All routes are listed below. 
Many of the pages also have functional links.**

“/movies” - all movies in the database

“/movies/{movieID}” - a specific movie. movieID is an integer in [0, 9]

“/” or “/index” - profile page for logged-in user

“/createMovie” - submit a new movie to the database

“/createPerson” - submit a new person to the database

“/login” - login page

“/persons”  - page for all persons (actors, directors, and writers) in the database

“/persons/{personID}” - page for a specific person. personID is an integer in [0, 3]  

“/users/{userID}” - page for a specific user. userID is an integer in [1, 5]  


The object outline and RESTful design documents can be found under the achopra_eli_2406FinalProject/docs directory.

