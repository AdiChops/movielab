const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let feedPostSchema = Schema({
  feedUser: {type:Schema.Types.ObjectId, ref: 'User'},
  feedPostText: {type: String},  
  subject: {type: Schema.Types.ObjectId},
  subjectType: {type: String},
  date: {type: Date}
});

module.exports = mongoose.model("FeedPost", feedPostSchema);