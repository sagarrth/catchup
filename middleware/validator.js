const express = require('express');
const responseGenerator =  require('./../libs/responseGenerator');

function validator(req, res, next) {
	if(req.url==='/signup' && req.body.firstName!=='' && req.body.lastName!=='' && req.body.email!=='' 
		&& req.body.phone!=='' && req.body.password!==''){
		next();
	} else if(req.url==='/login' && req.body.email!=='' && req.body.password!==''){
		next();
	} else {
		req.response = responseGenerator.generate(true, "some parameter missing", 400, null);
		next();
	}
}

module.exports = validator;