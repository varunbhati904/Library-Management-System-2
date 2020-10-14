var mongoose = require("mongoose");
var BookSchema = new mongoose.Schema({
name :{type:String},
author :{type:String},
ISBN : {type:Number},
ShelfNo : {type:String},
AccNo : {type:String},
publisher : {type:String},
category : {type:String},
Status : {type: String, default:"Available"}
});


module.exports = mongoose.model("Book", BookSchema);
