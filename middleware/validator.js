const express = require('express');
const responseGenerator =  require('./../libs/responseGenerator');

function getManadatoryParams(type, req) {
	let mandatoryParams = [];
	type = type.toLowerCase();
	if(type==='product') {
		mandatoryParams = ['name', 'description', 'category', 'price'];
	} else if(type==='user') {
		if(req.url==='/signup')
			mandatoryParams = ['firstName', 'lastName', 'email', 'phone', 'password'];
		else if(req.url==='/login')
			mandatoryParams = ['email', 'password'];
	} else if(type==='review') {
		mandatoryParams = ['name', 'comment', 'ratings'];
	}
	return mandatoryParams;
}

function validate(type) {
	return function(req, res, next) {
		let mandatoryParams = getManadatoryParams(type, req);
		for(let i = 0; i<mandatoryParams.length; i++){
			if(!(mandatoryParams[i] in req.body)){
				let errResponse = responseGenerator.generate(true, 'mandatory parameters missing', 401, null);
				next(errResponse);
			}
		}
		next();
	}
}

module.exports = validate;