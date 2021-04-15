const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let notificationSchema = Schema({
  notifiedUser: {type:Schema.Types.ObjectId, ref: 'User'},
  notificationText: {type: String},
  date: {type: Date},
  read: {type: Boolean}
});

module.exports = mongoose.model("Notification", notificationSchema);