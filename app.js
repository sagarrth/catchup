var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

var app = express();

//middleware for processing incoming http-requests
app.use(bodyParser.json({limit:'10mb', extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb', extended:true}));

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
} catch (error) {
  console.log(error.message);
} finally {
  //start the server and listen on port 3000
  app.listen(3000, function () {
    console.log('server started and listening on port 3000');
  });
}
