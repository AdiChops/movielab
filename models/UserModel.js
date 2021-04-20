const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  contributingUser: {type: Boolean, required: true},
  dateAccountCreated: {type: Date},
  usersFollowing: [{type:Schema.Types.ObjectId, ref: 'User'}],
  usersFollowedBy: [{type:Schema.Types.ObjectId, ref: 'User'}],
  personsFollowing: [{type:Schema.Types.ObjectId, ref: 'Person'}],
  watchlist: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  notifications: [{
    notification: {type:Schema.Types.ObjectId, ref: 'Notification'},
    read: Boolean
  }],
  reviews: [{type:Schema.Types.ObjectId, ref: 'Review'}]
});

module.exports = mongoose.model("User", userSchema);