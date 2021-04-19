const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let notificationSchema = Schema({
  subject: {type: Schema.Types.ObjectId},
  subjectType: {type: String, enum: ["User", "Person"]},
  notificationText: {type: String},
  movie: {type: Schema.Types.ObjectId, ref: "Movie"},
  date: {type: Date}
});

module.exports = mongoose.model("Notification", notificationSchema);