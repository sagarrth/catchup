const mongoose 	= 	require('mongoose');
const bcrypt	=	require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userName        : {type:String, unique:true, required:true, trim:true},
  firstName       : {type:String, required:true, trim:true},
  lastName        : {type:String, required:true, trim:true},
  email           : {type:String, unique:true, required:true, trim:true},
  phone           : {type:Number, unique:true, required:true, trim:true},
  password        : {type:String, required:true}
});


//verify if user exists and if exists the password is correct
UserSchema.statics.authenticate = (email, password, cb) => {	
	userModel.findOne({email: email}).exec((err, user) => {
		if(err){
			console.log(err);
			cb(err);
		} else {
			if(!user){
				console.log('No user found');
				let err = new Error('User not found!');
				err.status = 401;
				cb(err);
			} else {
				console.log('user found');
				bcrypt.compare(password, user.password, (error, result)=>{
					if(error) {
						cb(error);
					} else { 
						if(result===true){
							cb(null, user);
						} else {
							cb();
						}
					}
				});
			}
		}
	});	
};


//hash password before saving
UserSchema.pre('save', function(next){
	console.log('inside pre save hook');
	let user = this;
	bcrypt.hash(user.password, 5, (err, hash) => {
		if(err)
			next(err);
		user.password = hash;
		next();
	});
});

const userModel = mongoose.model('User', UserSchema);
