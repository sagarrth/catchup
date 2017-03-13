const mongoose = require('mongoose');

const addedProductSchema = new mongoose.Schema({
	productId: {type: mongoose.Schema.Types.ObjectId, ref:'Product'},
	quantity : {type: Number},
});

const CartSchema = new mongoose.Schema({
	belongsTo : {type: mongoose.Schema.Types.ObjectId, ref:'User'},
	listOfProducts : [addedProductSchema]
});

const cartModel = mongoose.model('Cart', CartSchema);
module.exports = cartModel;