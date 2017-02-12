var express      =    require('express');
var bodyParser   =    require('body-parser');
var cookieParser =    require('cookie-parser');
var session      =    require('express-session');
var mongoose     =    require('mongoose');
var logger       =    require('morgan');
var fs           =    require('fs');
var path         =    require('path');
var auth         =    require('./middleware/auth');

var app          =    express();

//set templating engine
app.set('view engine', 'jade');

//set views folder
app.set('views', path.join(__dirname, '/app/views'));

//middleware for logging
app.use(logger('dev'));

//middleware for processing incoming http-requests
app.use(bodyParser.json({limit:'10mb', extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb', extended:true}));
app.use(cookieParser());

//middleware for session handling
//initialization of session
app.use(session({
  name            :   'myCustomCookie',
  secret          :   'awesomeApp',
  resave          :   true,
  httpOnly        :   true,
  saveUnitialized :   true,
  cookie          :   {secure : false}
}));

var dbPath = 'mongodb://localhost/catchupDb';
//create a db connection
mongoose.connect(dbPath);
mongoose.connection.once('open', function () {
  console.log("database connection opened");
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
      var route = require(path.join(__dirname,'./app/controllers',fileName));
      route.controller(app);
    }
  });

  //middleware for handling session
  app.use(auth.setLoggedInUser(mongoose.model('User')));

  //default route
  app.get('/', function (req, res) {
      return res.redirect('/users/login');
  });

} catch (error) {
  console.log(error);
} finally {
  //start the server and listen on port 3000
  app.listen(3000, function () {
    console.log('server started and listening on port 3000');
  });
}
