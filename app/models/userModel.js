const mongoose 	= 	require('mongoose');
const bcrypt	=	require('bcryptjs');
const customLogger = require('./../../libs/customLogger');

const UserSchema = new mongoose.Schema({
  userName        		: {type:String, unique:true, trim:true},
  firstName       		: {type:String, required:true, trim:true},
  lastName        		: {type:String, required:true, trim:true},
  email           		: {type:String, unique:true, required:true, trim:true},
  phone           		: {type:Number, unique:true, required:true, trim:true},
  password        		: {type:String, required:true},
  type			  		: {type:String, default:'standard'},
  resetPasswordToken 	: {type:String},
  resetPasswordExpires  : {type:Date}
});


//verify if user exists and if exists the password is correct
UserSchema.statics.authenticate = (email, password, cb) => {	
	userModel.findOne({email: email}).exec((err, user) => {
		if(err){
			err.status = 500;
			customLogger('Error', 'Model', __filename, err.stack);
			cb(err, null);
		} else {
			if(!user){
				customLogger('Info', 'Model', __filename, 'User not found in db');
				let err = new Error('User not found in db');
				err.status = 401;
				cb(err, null);
			} else {
				customLogger('Info', 'Model', __filename, 'User found in db');
				bcrypt.compare(password, user.password, (error, result)=>{
					if(err) {
						err.status = 500;
						customLogger('Error', 'Model', __filename, err.stack);
						cb(err, null);
					} else { 
						if(result===true){
							customLogger('Info', 'Model', __filename, 'Password matched');
							cb(null, user);
						} else {
							customLogger('Info', 'Model', __filename, 'Wrong Password');
							let err = new Error('Wrong Password');
							err.status=401;
							cb(err, null);
						}
					}
				});
			}
		}
	});	
};


//hash password before saving
UserSchema.pre('save', function(next){
	let user = this;
	bcrypt.hash(user.password, 5, (err, hash) => {
		if(err){
			customLogger('Error', 'Model', __filename, 'Error while hashing password');
			next(err);
		}
		customLogger('Info', 'Model', __filename, 'Password hashed before saving');
		user.password = hash;
		next();
	});
});

const userModel = mongoose.model('User', UserSchema);
