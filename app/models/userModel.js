var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  userName        : {type:String, unique:true, required:true, trim:true},
  firstName       : {type:String, unique:true, required:true, trim:true},
  lastName        : {type:String, unique:true, required:true, trim:true},
  email           : {type:String, unique:true, required:true, trim:true},
  phone           : {type:Number, unique:true, required:true, trim:true},
  password        : {type:String, required:true}
});

mongoose.model('User', userSchema);
