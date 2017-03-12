const mongoose          =   require('mongoose');
const express           =   require('express');
const fs                =   require('fs');
const path              =   require('path');
const responseGenerator =   require('./../../libs/responseGenerator');
const auth              =   require('./../../middleware/auth');
const validate          =   require('./../../middleware/validator');
const customLogger      =   require('./../../libs/customLogger');
const shortid           =   require('shortid');
const userRouter        =   express.Router();
const users             =   mongoose.model('User');

function userController(app){

  //route to signup
  userRouter.post('/signup', validate('user'), (req, res, next) => {
    let newUser = {
      firstName :   req.body.firstName,
      lastName  :   req.body.lastName,
      email     :   req.body.email,
      password  :   req.body.password,
      phone     :   req.body.phone
    };
    newUser.userName = req.body.firstName+shortid.generate();
    req.body.type ? (newUser.type = req.body.type) : '';
    users.create( newUser, (err, user) => {
      if(err) {
        customLogger('Error', 'Controller', __filename, err.stack);
        let errResponse = responseGenerator.generate(true, err.message, 500, null);
        next(errResponse);
      } else {
        customLogger('Info', 'Controller', __filename, 'User successfully added to database');
        //Cloned the user object returned from the callback. The reason being the object was an instance of mongoose model
        //deleting the password property on it had no effect, it exposed the password getter method on its prototype and still
        //password property was accessible
        user = JSON.parse(JSON.stringify(user));
        delete user.password;
        req.session.user = user;
        res.send(responseGenerator.generate(false, 'User successfully added to database', 200, user));
      }
    });
  });

  //route to login
  userRouter.post('/login', validate('user'), (req, res, next) => {
    users.authenticate(req.body.email, req.body.password, (err, user) => {
      if(err) {
        customLogger('Error', 'Controller', __filename, err.stack);
        let errResponse = responseGenerator.generate(true, err.message, 500, null);
        next(errResponse);
      } else {
        customLogger('Info', 'Controller', __filename, 'User successfully logged in');
        //Cloned the user object returned from the callback. The reason being the object was an instance of mongoose model
        //deleting the password property on it had no effect, it exposed the password getter method on its prototype and still
        //password property was accessible
        user = JSON.parse(JSON.stringify(user));
        delete user.password;
        req.session.user = user;
        res.send(responseGenerator.generate(false, 'User successfully logged in', 200, user));
      }
    });
  });

  //route to do profile operations
  userRouter.route('/profile')
  //for all routes under profile, its protected and authentication is required
  .all(auth.checkLoggedIn)
  //route to get the profile details of an user
  .get((req, res, next) => {
    users.findById(req.session.user._id, (err, user) => {
      if(err) {
        customLogger('Error', 'Controller', __filename, err.stack);
        let errResponse = responseGenerator.generate(true, err.message, 500, null);
        next(errResponse);
      } else {
        delete user.password;
        customLogger('Info', 'Controller', __filename, 'Profile Details');
        res.send(responseGenerator.generate(false, 'Profile Details', 200, user));
      }
    });
  })
  //route to edit the profile details of an user
  .put((req, res, next) => {
    const updateObj = {};
    for(let i in req.body) {
      if(i!=='email' && i!=='userName') {
        updateObj[i] = req.body[i];
      }
    }
    users.findByIdAndUpdate(req.session.user._id, updateObj, {new:true}, (err, user) => {
      if(err) {
        customLogger('Error', 'Controller', __filename, err.stack);
        let errResponse = responseGenerator.generate(true, err.message, 500, null);
        next(errResponse);
      } else {
        delete user.password;
        customLogger('Info', 'Controller', __filename, 'Edited Profile Details');
        res.send(responseGenerator.generate(false, 'Edited Profile Details', 200, user));
      }
    });
  });

  //route to logout
  userRouter.get('/logout', function(req, res, next){
      req.session.destroy( (err) => {
        if(err) {
          customLogger('Error', 'Controller', __filename, err.stack);
          let errResponse = responseGenerator.generate(true, err.message, 500, null);
          next(errResponse); 
        } else {
          customLogger('Info', 'Controller', __filename, 'User Logged Out');
          res.send(responseGenerator.generate(false, 'User Logged Out', 200, null));
        }
      });
  });

  //userRouter.post('/forgotPassword', )

  app.use('/users', userRouter);
}

module.exports.controller = userController;
