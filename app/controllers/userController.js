var mongoose = require('mongoose');
var express = require('express');
var fs = require('fs');

var userRouter = express.Router();
var userModel = mongoose.model('User');

function userController(app){
  userRouter.get('/all', function (req, res) {
    userModel.find({}, function (err, users) {
      if(err){
        console.log(err.message);
      } else {
        
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
