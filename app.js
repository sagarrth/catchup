var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(bodyParser.json({limit:'10mb', extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb', extended:true}));


try {
  fs.readdirsync('./app/models').forEach(function (fileName) {
    if(fileName.indexOf('.js')>-1)
      require(path.join('./app/models',fileName));
  });

  fs.readdirsync('./app/controllers').forEach(function (fileName) {
    if(fileName.indexOf('.js')>-1){
      var route = require(path.join('./app/models',fileName));
      route.controller(app);
    }
  });
} catch (error) {
  console.log(error.message);
} finally {

}
