var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
name :{type:String},
rollno :{type:String,unique:true},
DOB : {type:Date},
Fine : {type:Number,default:0},
email : {type:String},
username : {type:String},
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
