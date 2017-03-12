const express       =    require('express');
const bodyParser    =    require('body-parser');
const session       =    require('express-session');
const mongoose      =    require('mongoose');
const logger        =    require('morgan');
const customLogger  =    require('./libs/customLogger');
const fs            =    require('fs');
const path          =    require('path');
const auth          =    require('./middleware/auth');
const config        =    require('./config');

const app           =    express();

//middleware for logging
app.use(logger('dev'));

//middleware for processing incoming http-requests
app.use(bodyParser.json({limit:'10mb', extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb', extended:true}));

//middleware for session handling
//initialization of session
app.use(session({
  name               :   'myCustomCookie',
  secret             :   config.secret,
  resave             :   true,
  httpOnly           :   true,
  saveUninitialized  :   true,
  cookie             :   {secure : false}
}));

//create a db connection
mongoose.connect(config.dbPath);
mongoose.connection.once('open', function () {
  customLogger('Info', 'Entry Point', __filename, 'database connection opened');
});

try {
  //dynamically load the models
  fs.readdirSync('./app/models').forEach(function (fileName) {
    if(fileName.indexOf('.js')>-1)
      require(path.join(__dirname,'./app/models',fileName));
  });

  //dynamically load the controllers
  fs.readdirSync('./app/controllers').forEach(function (fileName) {
    if(fileName.indexOf('.js')>-1){
      let route = require(path.join(__dirname,'./app/controllers',fileName));
      route.controller(app);
    }
  });

  //middleware for handling session
  app.use(auth.setLoggedInUser(mongoose.model('User')));

  app.use((err, req, res, next) => {
    res.status(err.status);
    res.send(err);
  });

} catch (error) {
  customLogger('Info', 'Entry Point', __filename, error);
} finally {
  //start the server and listen on port 3000
  app.listen(3000, function () {
    customLogger('Info', 'Entry Point', __filename, 'server started and listening on port 3000');
  });
}
