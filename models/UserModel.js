const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  contributingUser: {type: Boolean, required: true},
  dateAccountCreated: {type: Date},
  usersFollowing: [{type:Schema.Types.ObjectId, ref: 'User'}],
  usersFollowedBy: [{type:Schema.Types.ObjectId, ref: 'User'}],
  watchlist: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  notifcations: [{type:Schema.Types.ObjectId, ref: 'Notification'}],
  reviews: [{type:Schema.Types.ObjectId, ref: 'Review'}],
  feedPosts: [{type:Schema.Types.ObjectId, ref: 'FeedPost'}]
});

module.exports = mongoose.model("User", userSchema);
