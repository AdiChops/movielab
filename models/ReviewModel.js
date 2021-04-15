const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fs = require("fs");

let reviewSchema = Schema({

    rating: {Number, required: true},
    reviewSummary: String,
    fullReview: String
  });

module.exports = mongoose.model("Review", reviewSchema);

