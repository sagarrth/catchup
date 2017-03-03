const mongoose          =  require('mongoose');
const express           =  require('express');
const fs                =  require('fs');
const path              =  require('path');
const responseGenerator =  require('./../../libs/responseGenerator');
const auth              =  require('./../../middleware/auth');
const validator         =  require('./../../middleware/validator');

const userRouter        =   express.Router();
const userModel         =   mongoose.model('User');

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
  userRouter.post('/signup', validator, (req, res, next) => {
    var response = req.response;
    if(!response){
      console.log('no response from validator');
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
          console.log(err, 'error occurred while saving document');
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
      console.log('error response from validator');
      res.render('signup', {
        title   : 'Sign Up',
        error   : response.message
      });
    }
        
  });

  //login API
  userRouter.post('/login', validator, function (req, res, next) {
    let response = req.response;
    if(!response){
      userModel.authenticate(req.body.email, req.body.password, function (error, user) {
        if(error){
          response = responseGenerator.generate(true, error.message, error.status, null);
          res.render('error', {
            title   : 'Login',
            message   : response.message
          }); 
        } else if(!user) {
          res.render('login', {
            title   : 'Login',
            error   : 'Incorrect password'
          }); 
        } else {
          req.session.user = user;
          delete req.session.user.password;
          res.redirect('/users/dashboard');
        }
      });
    } else {
      res.render('login', {
        title   : 'Login',
        error   : response.message
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
