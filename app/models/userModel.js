var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  userName        : {type:String, default:'', required:true},
  firstName       : {type:String, default:''},
  lastName        : {type:String, default:''},
  email           : {type:String, default:''},
  mobileNumber    : {type:String, default:''},
  password        : {type:String, default:''}
});

mongoose.model('User', userSchema);
