const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    movie: {type:Schema.Types.ObjectId, ref: 'Movie'},
    reviewer: {type:Schema.Types.ObjectId, ref: 'User'},
    rating: {type: Number, required: true},
    reviewSummary: String,
    fullReview: String,
    reviewDate: Date
  });

module.exports = mongoose.model("Review", reviewSchema);

