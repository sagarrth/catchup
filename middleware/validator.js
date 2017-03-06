const express = require('express');
const responseGenerator =  require('./../libs/responseGenerator');

function getManadatoryParams(type) {
	let mandatoryParams = [];
	type = type.toLowerCase();
	if(type==='product') {
		mandatoryParams = ['name', 'description', 'category', 'price'];
	} else if(type==='user') {
		mandatoryParams = ['firstName', 'lastName', 'email', 'phone', 'password'];
	}
	return mandatoryParams;
}

function validate(type) {
	let mandatoryParams = getManadatoryParams(type)
	return function(req, res, next) {
		for(let i = 0; i<mandatoryParams.length; i++){
			if(!(mandatoryParams[i] in req.body)){
				let err = new Error('mandatory parameters missing');
				err.status = 401;
				next(err);
			}
		}
		next();
	}
}

/*function validator(req, res, next) {
	if(req.url==='/signup' && req.body.firstName!=='' && req.body.lastName!=='' && req.body.email!=='' 
		&& req.body.phone!=='' && req.body.password!==''){
		next();
	} else if(req.url==='/login' && req.body.email!=='' && req.body.password!==''){
		next();
	} else if(req.url==='/create' && req.body.name!==undefined && req.body.description && req.body.category!==undefined 
		&& req.body.price!==undefined) {
		next();
	} else {
		req.response = responseGenerator.generate(true, "some parameter missing", 400, null);
		next();
	}
}*/

module.exports = validate;