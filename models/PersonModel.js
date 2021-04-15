const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let personSchema = Schema({
    name: String,
    director: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
    actor: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
    writer: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  });

module.exports = mongoose.model("Person", personSchema);

