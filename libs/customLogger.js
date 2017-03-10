const clc = require('cli-color');

const error = clc.red.bold;
const info 	= clc.blue.bold;

function customLogger(type, level, path, message) {
	if(type.toLowerCase()==='error')
		console.log(error(type+' : '+level+' : '+path+' - '+message));
	else if(type.toLowerCase()==='info')
		console.log(info(type+' : '+level+' : '+path+' - '+message));
}

module.exports = customLogger; 