const express 		 	= 	require('express');
const mongoose 		 	= 	require('mongoose');
const carts 		 	= 	require('./../models/cartModel');
const validate 		 	= 	require('./../../middleware/validator');
const auth 			 	= 	require('./../../middleware/auth');
const customLogger 	 	= 	require('./../../libs/customLogger');
const responseGenerator =	require('./../../libs/responseGenerator');
const cartRouter  		= 	express.Router();

function cartController(app) {

	/*
		1.Get route to view all the entries in the cart collection, only accessible to admin
		2.Post route to add products to the cart accesible to any registered user
		3.Delete route to drop the carts collections, only accessible to admin
	*/
	cartRouter.route('/')
	.all(auth.checkLoggedIn)
	.get(auth.checkAdmin, (req, res, next) => {
		carts.find({}, (err, carts) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, 'All carts received');
				res.send(responseGenerator.generate(false, 'All carts received', 200, carts));
			}
		});	
	})
	//to keep simple, anytime a user wants to add products to cart, the whole list of products should be sent. Which should
	//also include the earlier products added
	.post((req, res, next) => {
		let newCart = {
			belongsTo : req.session.user._id,
			listOfProducts : req.body.listOfProducts
		}
		carts.create(newCart, (err, cart) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, 'Cart Created');
				res.send(responseGenerator.generate(false, 'Cart Added', 200, cart));	
			}
		});
	})
	.delete(auth.checkAdmin, (req, res, next) => {
		carts.remove((err, resp) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, resp);
				res.send(responseGenerator.generate(false, 'Carts collection dropped', 200, resp));	
			}
		})
	});



	/*
		1. Get route to view the cart details of an user
		2. Delete route to delete all the elements in the cart at once, it will delete the cart record from the collection
		3. Both the operations can be performed only by the user to whom the cart belongs
	*/
	cartRouter.route('/myCart')
	.all(auth.checkLoggedIn)
	.get((req, res, next) => {
		carts.find({belongsTo:req.session.user._id}).populate('belongsTo', {password:0}).populate('listOfProducts.prodId').exec((err, cart) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!cart){
					customLogger('Error', 'Controller', __filename, 'Cart details not found');
					res.send(responseGenerator.generate(true, 'Cart details not found', 200, null));
				} else {
					customLogger('Info', 'Controller', __filename, 'Specific cart sent');
					res.send(responseGenerator.generate(false, 'Specific cart sent', 200, carts));
				}
			}
		});
	})
	.delete((req, res, next) => {
		carts.findOneAndRemove({"belongsTo":req.session.user._id}, (err, resp) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, 'Deleted cart details');
				res.send(responseGenerator.generate(false, 'Deleted cart details', 200, resp));
			}
		});
	})


	/*
		1. Put route is to modify the quantity of a particular product in the cart. The productId is sent in req.params.productId
		2. Delete route to delete a particular product from the cart
		3. Both the operations can be done only by the user to whom the cart belongs
	*/
	cartRouter.route('/myCart/:productId')
	.all(auth.checkLoggedIn)
	.put((req, res, next) => {
		carts.update(
			{"belongsTo": req.session.user._id, "listOfProducts.productId": req.params.productId},
			{$set:{"listOfProducts.$.quantity":req.body.quantity}},
			(err, resp) => {
				if(err){
					customLogger('Error', 'Controller', __filename, err.stack);
	        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
	        		next(errResponse);
				} else {
					customLogger('Info', 'Controller', __filename, 'Individual product modified in cart');
					res.send(responseGenerator.generate(false, 'Individual product modified in cart', 200, resp));
				}
			}
		)
	})
	.delete((req, res, next) => {
		carts.findOne({belongsTo:req.session.user._id}, (err, cart) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!cart) {
					customLogger('Error', 'Controller', __filename, 'Cart details not found');
					res.send(responseGenerator.generate(true, 'Cart details not found', 200, null));
				} else {
					let addedProduct;
					for(let index in cart.listOfProducts) {
						if(!isNaN(Number(index))) {
							if(cart.listOfProducts[index].productId == req.params.productId) {
								addedProduct = cart.listOfProducts[index];
							}
						}
					}
					addedProduct.remove();
					cart.save((err, data) => {
						if(err) {
							customLogger('Error', 'Controller', __filename, err.stack);
        					let errResponse = responseGenerator.generate(true, err.message, 500, null);
        					next(errResponse);
						} else {
							customLogger('Info', 'Controller', __filename, 'Deleted the product from the cart');
							res.send(responseGenerator.generate(false, 'Deleted the product from the cart', 200, data));
						}
					})
				}
			}
		});
	})

	app.use('/carts', cartRouter);
}

module.exports.controller = cartController;