# COMP 2406 Final Project Check-In
Winter 2021

## Students
- Aaditya Chopra
- Erica Li
## How to Run
### Option 1
To install the dependancies and start the server, simply enter the `npm run clean-start` command.
This command will install the node modules and then start the server.
Once the `Server listening at http://localhost:3000` message appears, then the index page (logged-in user's profile page) can be found by entering http://localhost:3000 in the browser of choice.

To only run the server (once the dependencies are installed), simply enter the `npm start` command.

### Option 2
To install the dependancies, enter the `npm install` command.
Once the node modules are installed, enter the `node app.js` command to start the server.
Once the `Server listening at http://localhost:3000` message appears, then the index page can be found by entering http://localhost:3000 in the browser of choice.
## How to Test

**Enter the appropriate URL route into your browser (e.g. http://localhost:3000/movies) to display the corresponding page. All routes are listed below. 
Many of the pages also have functional links.**

"/movies" - all movies in the database

"/movies/{movieID}" - a specific movie. movieID is an integer in [0, 9]

"/" or "/index" - profile page for logged-in user

"/createMovie" - submit a new movie to the database

"/createPerson" - submit a new person to the database

"/login" or "/login.html"- login page

"/persons"  - page for all persons (actors, directors, and writers) in the database

"/persons/{personID}" - page for a specific person. personID is an integer in [0, 3]  

"/users/{userID}" - page for a specific user. userID is an integer in [1, 5]  


## Documentation
The object outline and RESTful design documents can be found under the `docs` directory.
