const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    movie: {type:Schema.Types.ObjectId, ref: 'Movie'},
    reviewer: {type:Schema.Types.ObjectId, ref: 'User'},
    rating: {Number, required: true},
    reviewSummary: String,
    fullReview: String
  });

module.exports = mongoose.model("Review", reviewSchema);

