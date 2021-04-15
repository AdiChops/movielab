const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fs = require("fs");

let movieSchema = Schema({
    title: {type: String, required: true},
  year: {type: String},
  runtime: {type: String},
  genre: [String],
  director: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  actor: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  writer: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  plot: [String]
});

module.exports = mongoose.model("Movie", movieSchema);

