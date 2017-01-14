var mongoose =  require('mongoose');
var express  =  require('express');
var fs       =  require('fs');
var path     =  require('path');

var userRouter        =   express.Router();
var userModel         =   mongoose.model('User');
var responseGenerator =   require('./../../libs/responseGenerator');

function userController(app){

  userRouter.post('/signup', function (req, res) {
    var response;
    console.log('inside signup');
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
        } else {
          response = responseGenerator.generate(false, "successfully signed up", 201, newUser);
        }
        res.send(response);
      });
    } else {
      response = responseGenerator.generate(true, "some parameter missing", 400, null);
    }
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
