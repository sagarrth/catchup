var mongoose =  require('mongoose');
var express  =  require('express');
var fs       =  require('fs');
var path     =  require('path');

var userRouter        =   express.Router();
var userModel         =   mongoose.model('User');
var responseGenerator =   require('./../../libs/responseGenerator');

function userController(app){

  //get login screen
  userRouter.get('/login/screen', function (req, res){
    res.render('login');
  });

  //get sign up screen
  userRouter.get('/signup/screen', function (req, res) {
    res.render('signup');
  });

  //signup API
  userRouter.post('/signup', function (req, res) {
    var response;
    if(req.body.firstName!==undefined && req.body.lastName!==undefined && req.body.email!==undefined && req.body.mobileNumber!==undefined && req.body.password!==undefined){
      var newUser = new userModel({
        userName        : req.body.firstName+''+req.body.lastName,
        firstName       : req.body.firstName,
        lastName        : req.body.lastName,
        email           : req.body.email,
        mobileNumber    : req.body.mobileNumber,
        password        : req.body.password
      });

      newUser.save(function (err) {
        if(err){
          response = responseGenerator.generate(true, err.message, 500, null);
          res.render('error', {
            message : response.message,
            error   : response.data
          });
        } else {
          response = responseGenerator.generate(false, "successfully signed up", 201, newUser);
          res.render('dashboard', {user:newUser});
        }
      });
    } else {
        response = responseGenerator.generate(true, "some parameter missing", 400, null);
        res.render('error', {
          message : response.message,
          error   : response.data
        });
    }
  });

  //login API
  userRouter.post('/login', function (req, res) {
    var response;
    userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]}, function (err, user) {
      if(err){
        response = responseGenerator.generate(true, err.message, 500, null);
      } else if(user===null || user===undefined){
        response = responseGenerator.generate(true, 'user not found. Check your email and password', 404, null);
      } else{
        response = responseGenerator.generate(false, 'successfully logged in user', 200, user);
      }
      res.send(response);
    });
  });

  userRouter.get('/all', function (req, res) {
    userModel.find({}, function (err, users) {
      if(err){
        console.log(err.message);
      } else {
        console.log(users);
      }
    });
    res.send('this is a route to get all users. Db code to be written here.');
  });

  userRouter.get('/:userName', function (req, res) {
    res.send('this is a route to get information of a particular user.');
  });

  app.use('/0.1/users', userRouter);
}

module.exports.controller = userController;
