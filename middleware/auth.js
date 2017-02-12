var mongoose  =  require('mongoose');

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

function checkLogin(req, res, next){
  if(!req.user && !req.session.user){
    res.redirect('/users/login/screen');
  } else {
    next();
  }
}

module.exports.setLoggedInUser = setLoggedInUser;
module.exports.checkLogin = checkLogin;
