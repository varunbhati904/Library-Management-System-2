var date = new Date();
var ndate = new Date();
var mongoose = require("mongoose");
var IssueSchema = new mongoose.Schema({
AccNo : {type:String},
username : {type:String},
name:{type:String},
issud_on:{type:Date,default:date},
Due_on : {type:Date,default:ndate.setDate(ndate.getDate() + 30)},
});
module.exports = mongoose.model("Issue", IssueSchema);
