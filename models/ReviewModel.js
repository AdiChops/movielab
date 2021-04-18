const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    movie: {type:Schema.Types.ObjectId, ref: 'Movie'},
    reviewer: {type:Schema.Types.ObjectId, ref: 'User'},
    rating: {type: Number, required: true, min:[0, "Rating must be greater than 0"], max: [10, "Rating must be less than or equal to 10"]},
    reviewSummary: String,
    fullReview: String,
    reviewDate: Date
  });

module.exports = mongoose.model("Review", reviewSchema);

