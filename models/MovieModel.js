const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
  title: {type: String, required: true},
  year: {type: String},
  runtime: {type: String},
  genre: [String],
  director: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  actor: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  writer: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  plot: {type: String},
  reviews: [{type:Schema.Types.ObjectId, ref: 'Review'}],
  similarMovies: [{type:Schema.Types.ObjectId, ref: 'Movie'}]
});

module.exports = mongoose.model("Movie", movieSchema);

