const mongoose = require('mongoose');


const ReviewsSchema = new mongoose.Schema({
	name	: 	{type:String, required:true},
	comment :   {type:String, required:true},
	ratings : 	{type:Number, default:0, min:0, max:5},
	date 	: 	{type:Date, default: Date.now()}
});

const ProductSchema = new mongoose.Schema({
	name		: {type:String, required:true},
	description : {type:String, required:true},
	category	: {type:String, required:true},
	img_url     : {type:String},
	price		: {type:Number, required:true},
	ratings     : {type:Number, default:0, min:0, max:5}
	reviews		: [ReviewsSchema]
});


ProductSchema.pre('save', function (next) {
	
});

const productModel = mongoose.model('Product', ProductSchema);

module.exports = productModel;