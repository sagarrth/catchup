const mongoose  =  require('mongoose');
const responseGenerator =  require('./../libs/responseGenerator');

function checkAdmin(req, res, next) {
  if(req.session && req.session.user && req.session.user.type==='admin'){
    next();
  } else {
    let errResponse = responseGenerator.generate(true, 'Insufficient Access', 401, null);
    next(errResponse);
  }
}


function setLoggedInUser(userModel) {
  return function(req, res, next){
    if(req.session && req.session.user){
      userModel.findOne({'email':req.session.user.email}, function (err, user) {
        if(user){
          req.user = user;
          delete req.user.password;
          req.session.user = user;
          delete req.session.user.password;
          next();
        } else {
          //do nothing
        }
      });
    } else {
      next();
    }
  };
}

function checkLoggedIn(req, res, next){
  if(!req.user && !req.session.user){
    let errResponse = responseGenerator.generate(true, 'User not in session', 401, null);
    next(errResponse);
  } else {
    next();
  }
}

module.exports.setLoggedInUser = setLoggedInUser;
module.exports.checkLoggedIn = checkLoggedIn;
module.exports.checkAdmin = checkAdmin;