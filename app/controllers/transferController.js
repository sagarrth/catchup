var express = require('express');
var appRouter = express.Router();

function transferController(app) {
  appRouter.get('/', function (req, res, next) {
    console.log('i am in app controller');
    next();
  });
  appRouter.use('/', express.static('angular-app'));
  app.use('/app', appRouter);
}

module.exports.controller = transferController;
