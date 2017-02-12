var mongoose          =  require('mongoose');
var express           =  require('express');
var fs                =  require('fs');
var path              =  require('path');
var responseGenerator =  require('./../../libs/responseGenerator');
var auth              =  require('./../../middleware/auth');

var userRouter        =   express.Router();
var userModel         =   mongoose.model('User');

function userController(app){

  //get login screen
  userRouter.get('/login', function (req, res){
    res.render('login',{
      'title' : 'Login'
    });
  });

  //get sign up screen
  userRouter.get('/signup', function (req, res) {
    res.render('signup',{
      'title' : 'Sign Up'
    });
  });

  //signup API
  userRouter.post('/signup', function (req, res) {
    var response;
    if(req.body.firstName!==undefined && req.body.lastName!==undefined && req.body.email!==undefined && req.body.phone!==undefined && req.body.password!==undefined){
      var newUser = new userModel({
        userName        : req.body.firstName+''+req.body.lastName,
        firstName       : req.body.firstName,
        lastName        : req.body.lastName,
        email           : req.body.email,
        phone           : req.body.phone,
        password        : req.body.password
      });

      newUser.save(function (err) {
        if(err){
          response = responseGenerator.generate(true, err.message, 500, null);
          res.render('signup', {
            title   : 'Sign Up',
            error   : response.message
          });
        } else {
          req.session.user = newUser;
          delete req.session.user.password;
          res.redirect('/users/dashboard');
        }
      });
    } else {
        response = responseGenerator.generate(true, "some parameter missing", 400, null);
        res.render('error', {
          title   : 'Sign Up',
          error   : response.message
        });
    }
  });

  //login API
  userRouter.post('/login', function (req, res) {
    let response;
    if(req.body.email && req.body.password){
      userModel.authenticate(req.body.email, req.body.password, function (error, user) {
        if(error){
          response = responseGenerator.generate(true, error.message, error.status, null);
          res.render('error', {
            title   : 'Login',
            message   : response.message
          }); 
        } else if(!user) {
          res.render('error', {
            title   : 'Login',
            message   : 'Incorrect password'
          }); 
        } else {
          req.session.user = user;
          delete req.session.user.password;
          res.redirect('/users/dashboard');
        }
      });
    } else {
      response = responseGenerator.generate(true, "some parameter missing", 400, null);
      res.render('error', {
        title   : 'Login',
        message   : response.message
      }); 
    }
  });

  //dashboard route
  userRouter.get('/dashboard', auth.checkLogin, function(req, res){
    res.render('dashboard', {
      title : 'Dashboard',
      user : req.session.user
    });
  });

  //logout route
  userRouter.get('/logout', function(req, res){
      req.session.destroy(function(err) {
        res.redirect('/users/login');
      });
  });

  app.use('/users', userRouter);
}

module.exports.controller = userController;
