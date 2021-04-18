const fileName = "./data/movie-data-2500.json";
const userFile = "./data/user-data.json";
const mongoose = require("mongoose");

let Movie = require("./models/MovieModel")
let Person = require("./models/PersonModel");
let Review = require("./models/ReviewModel");
let User = require("./models/UserModel")

//Array of all movie documents (no duplicates)
let allMovies = [];
//Object to find people by name easier than using array (works since people names are assumed unique)
let people = {};
//Array of all people documents (no duplicates)
//(this is only used so we don't have to iterate over the people object later)
let allPeople = [];
//Array of all user documents
let allUsers = [];

//Takes a person name, movie document, and position ('actor', 'director', or 'writer' - matches the schema fields)
//Creates a new person if one with that name doesn't exist already
//Updates the person document to have the given movie's ID
//Updates the given movie document to have the person's ID
//The field that is updated in either document is the one indicated by 'position'
//This relies on the fact that the fields use the same name in both document types (e.g., Movie.actor and Person.actor)
function addPersonToMovie(personName, movie, position) {
  //If our people object does not contain this name (i.e., this is a new person)
  if (!people.hasOwnProperty(personName)) {
    //Create a new Person document, set initial state
    let newPerson = new Person();

    //This is a key piece of functionality
    //We can use Mongoose to generate ObjectIDs OUTSIDE of the database
    //So we can use these IDs before we have actually inserted anything    
    newPerson._id = mongoose.Types.ObjectId();

    newPerson.name = personName;
    newPerson.director = [];
    newPerson.actor = [];
    newPerson.writer = [];
    //Add new Person document to our array of all people
    allPeople.push(newPerson);
    //Update the people object (name -> person document)
    people[newPerson.name] = newPerson;
  }

  //At this point, we know the movie and person are defined documents
  //Retrieve the current person using their name, update the movie and person
  let curPerson = people[personName];
  curPerson[position].push(movie._id);
  movie[position].push(curPerson._id);
}

const userData = require(userFile);
userData.forEach(user => {
  let newUser = new User();
  newUser._id = mongoose.Types.ObjectId();
  newUser.username = user.username;
  newUser.password = user.password;
  newUser.contributingUser = user.contributingUser;
  newUser.dateAccountCreated = user.dateAccountCreated;
  allUsers.push(newUser);

});

//Read the JSON data provided in the given file
//This is an array of objects representing movies
let data = require(fileName);
data.forEach(movie => {
  /*
  movie is something like:
    {
      "Title":"The Ballad of Cable Hogue",
      "Year":"1970",
      "Rated":"R",
      "Released":"18 Mar 1970",
      "Runtime":"121 min",
      "Genre":["Comedy","Drama","Romance","Western"],
      "Director":["Sam Peckinpah"],
      "Writer":["John Crawford","Edmund Penney"],
      "Actors":["Jason Robards","Stella Stevens","David Warner","Strother Martin"],
      "Plot":"A hobo accidentally stumbles onto a water spring, and creates a profitable way station in the middle of the desert.",
      "Awards":"1 win & 1 nomination.",
      "Poster":"https://m.media-amazon.com/images/M/MV5BMTQwMjkwNjE0Ml5BMl5BanBnXkFtZTgwOTU5ODIyMTE@._V1_SX300.jpg"
    }
  */

  //Create a new movie document using the Mongoose model
  //Copy over the required basic movie data
  let newMovie = new Movie();
  newMovie._id = mongoose.Types.ObjectId();
  newMovie.title = movie.Title;
  newMovie.year = movie.Year;
  newMovie.runtime = movie.Runtime;
  newMovie.genre = movie.Genre;
  newMovie.plot = movie.Plot;

  //For each actor in this movies Actor array, call the addPersonToMovie function
  //This function will create a new person if one with the given name doesn't exist
  //It will also update that person document and movie document
  movie.Actors.forEach(actorName => {
    addPersonToMovie(actorName, newMovie, "actor");
  })

  //Repeat for directors
  movie.Director.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "director");
  })

  //Repeast for writers
  movie.Writer.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "writer");
  })

  //Add the movie to our array of all movies (these are added to the database once we are finished)
  allMovies.push(newMovie)
})

/*
Up until this point, everything we have done is synchronous. This makes
it easier to coordinate as you don't have to worry about callbacks, etc..
At this point, we have a bunch of movie and people Mongoose documents.
These documents have interlinking IDs.
You could also add users, reviews, etc. to the data in a similar way.
*/

mongoose.connect('mongodb://localhost/moviedata', { useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  //We are connected. Drop the database first so we start fresh each time.
  mongoose.connection.db.dropDatabase(function (err, result) {

    // Add all sample users
    User.insertMany(allUsers, async function (err, result) {
      if (err) { console.error(err); return; }
      await userData.forEach(user => {
        console.log(user);
        // update usersFollowing lists of each user
        user.usersFollowing.forEach(uf => {
          User.findOne({ username: uf }, function (err, following) {
            User.findOne({ username: user.username }, function (err, follower) {
              User.updateOne({ username: follower.username }, { $push: { usersFollowing: following._id } }).then(async () => {
                await User.updateOne({ username: following.username }, { $push: { usersFollowedBy: follower._id } });
              });
            });
          });
        });
      });

      //Add all of the movie documents to the database
      Movie.insertMany(allMovies, function (err, result) {
        if (err) {
          console.log(err);
          return;
        }

        //Add all of the people documents to the database
        Person.insertMany(allPeople, async function (err, result) {
          if (err) {
            console.log(err);
            return;
          }

          await userData.forEach(user =>
            {
              user.reviews.forEach(rev => {
                Movie.findOne({"title":rev.title}, function(err, movieRes){
                  if(err){
                    console.error(err);
                    return;
                  }
                  User.findOne({"username": user.username}, function(err, userRes){
                    let review = new Review();
                    review.rating = rev.rating;
                    review.movie = movieRes._id;
                    review.reviewer = userRes._id;
                    review.reviewSummary = rev.summary;
                    review.fullReview = rev.full;
                    review.reviewDate = rev.date;
                    Review.create(review, function(error, revResult){
                      if(error){
                        console.error(error);
                        return;
                      }
                      User.updateOne({ username: user.username }, { $push: { reviews: revResult._id } });
                      Movie.findByIdAndUpdate(movieRes._id, { $push: { reviews: revResult._id } });
                    });
                  });
                 
                })
              })
            }
          );
          //Once all movies/people have been added, query for movie Toy Story and person Tom Hanks
          Movie.findOne({ title: "The Ballad of Cable Hogue" }).populate("director actor writer").exec(function (err, result) {
            if (err) throw err;
            console.log(result);

            Person.findOne({ name: "Joe Mantegna" }).populate("actor director writer").exec(function (err, result) {
              if (err) throw err;
              console.log(result);

              Person.find({}).exec(function (err, result) {
                if (err) throw err;
                console.log(result);
                mongoose.connection.close();
              });

            });
          });
        });
      });

    });
  });
});