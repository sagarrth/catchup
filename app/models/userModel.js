const mongoose 	= 	require('mongoose');
const bcrypt	=	require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName        : {type:String, unique:true, required:true, trim:true},
  firstName       : {type:String, required:true, trim:true},
  lastName        : {type:String, required:true, trim:true},
  email           : {type:String, unique:true, required:true, trim:true},
  phone           : {type:Number, unique:true, required:true, trim:true},
  password        : {type:String, required:true}
});

UserSchema.pre('save', function (next) {
	let user = this;
	bcrypt.hash(user.password, 5, function (err, hash) {
		if(err)
			next(err);
		user.password = hash;
		next();
	});
});

mongoose.model('User', UserSchema);
