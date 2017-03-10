const express 		 	= 	require('express');
const mongoose 		 	= 	require('mongoose');
const products 		 	= 	require('./../models/productModel');
const validate 		 	= 	require('./../../middleware/validator');
const auth 			 	= 	require('./../../middleware/auth');
const customLogger 	 	= 	require('./../../libs/customLogger');
const responseGenerator =	require('./../../libs/responseGenerator');
const productRouter  	= 	express.Router();

function productController(app){

	/**
		route for the collection level
		1.admin access is required to add a product, or dropping the entire products collection
		2.unrestricted route for viewing the list of products
	**/
	productRouter.route('/')
	.get((req, res, next) => {
		products.find({}, (err, products) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, 'All products received');
				res.send(responseGenerator.generate(false, 'All products received', 200, products));
			}
		});
	})
	.post(auth.checkAdmin, validate('product'), (req, res, next) => {
		let newProduct = {
			name: req.body.name,
			description : req.body.description,
			category : req.body.category,
			price : req.body.price,
			manufacturer : req.body.manufacturer
		};
		req.body.img_url ? (newProduct["img_url"] = req.body.img_url) : '';
		products.create(newProduct, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, 'Product Added');
				res.send(responseGenerator.generate(false, 'Product Added', 200, product));	
			}
		});
	})
	.delete(auth.checkAdmin, (req, res, next) => {
		products.remove((err, resp) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		let errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				customLogger('Info', 'Controller', __filename, resp);
				res.send(responseGenerator.generate(false, 'Product collection dropped', 200, null));	
			}
		});
	});


	/**
		route for the document level
		1.unrestricted route for viewing a particular product
		2.admin access is required to modify a product, or delete a product
	**/
	productRouter.route('/:productId')
	.get((req, res, next) => {
		let errResponse;
		products.findById(req.params.productId, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!product) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
					next(errResponse);	
				} else {
					customLogger('Info', 'Controller', __filename, 'Individual product fetched');
					res.send(responseGenerator.generate(false, 'Individual product fetched', 200, product));
				}
			}
		});
	})
	.put(auth.checkAdmin, (req, res, next) => {
		const updateObj = {};
	    for(let i in req.body) {
	    	if(i!=='ratings')
	       		updateObj[i] = req.body[i];
	    }
	    let errResponse;
		products.findByIdAndUpdate(req.params.productId, updateObj, {new: true}, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!product) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
					next(errResponse);	
				} else {
					customLogger('Info', 'Controller', __filename, 'Individual product modified');
					res.send(responseGenerator.generate(false, 'Individual product modified', 200, product));
				}	
			}
		});
	})
	.delete(auth.checkAdmin, (req, res, next) => {
		let errResponse;
		products.findByIdAndRemove(req.params.productId, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!product) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
					next(errResponse);	
				} else {
					customLogger('Info', 'Controller', __filename, 'Individual product deleted');
					res.send(responseGenerator.generate(false, 'Individual product deleted', 200, product));
				}	
			}
		});
	});



	/**
		route for the sub-document level
		1.unrestricted route for viewing all reviews of a product
		2.registered user can only add a review to a product, after review is added, 
		  the average rating is calculated for the product using aggregation and it is updated for the product
		3.admin user can delete all reviews of a product at once
	**/
	productRouter.route('/:productId/reviews')
	.get((req, res, next) => {
		let errResponse
		products.findById(req.params.productId, {reviews:1, _id:0}, (err, data) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				console.log('reviews received', data);
				if(!data) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
					next(errResponse);	
				} else if(data.reviews.length===0) {
					customLogger('Info', 'Controller', __filename, 'No reviews for the product');
					res.send(responseGenerator.generate(false, 'No reviews for the product', 200, null));
				} else {
					customLogger('Info', 'Controller', __filename, 'Fetched reviews for the product');
					res.send(responseGenerator.generate(false, 'Fetched reviews for the product', 200, data.reviews));
				}
			}
		});
	})
	.post(auth.checkLoggedIn, validate('review'), (req, res, next) => {
		let newReview = {
			name : req.body.name,
			comment : req.body.comment,
			ratings : req.body.ratings,
		}
		let errResponse;
		products.findByIdAndUpdate(req.params.productId, {$push: {reviews: newReview}}, {new:true}, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!product) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
        			next(errResponse);
				} else {
					customLogger('Info', 'Controller', __filename, 'Successfully added the review');
					products.aggregate(
						{$match: {_id: product._id}},
						{$project: {_id:0, "reviews.ratings":1}},
						{$unwind:"$reviews"},
						{$group: {_id:null, avgRating:{$avg:"$reviews.ratings"}}}, (err, data) => {
							if(err) {
								customLogger('Error', 'Controller', __filename, err.stack);
	        					let errResponse = responseGenerator.generate(true, err.message, 500, null);
	        					next(errResponse);		
							} else {
								customLogger('Info', 'Controller', __filename, 'Aggregation query successfully performed to get average ratings');
								products.findByIdAndUpdate(product._id, {ratings:data[0].avgRating}, {new:true}, (err, updatedProduct) => {
									if(err) {
										customLogger('Error', 'Controller', __filename, err.stack);
			        					let errResponse = responseGenerator.generate(true, err.message, 500, null);
			        					next(errResponse);		
									} else {
										customLogger('Info', 'Controller', __filename, 'Updated the product with average ratings');
										res.send(responseGenerator.generate(false, 'Added review and updated the product with average ratings', 200, updatedProduct));
									}
								});
							}
						}
					);
				}
			}
		});
	})
	.delete(auth.checkAdmin, (req, res, next) => {
		let errResponse;
		products.findByIdAndUpdate(req.params.productId, {"reviews":[]}, {new:true}, (err, product) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
				if(!product) {
					customLogger('Error', 'Controller', __filename, 'Product not found');
					errResponse = responseGenerator.generate(true, 'Product not found', 404, null);
					next(errResponse);		
				} else {
					customLogger('Info', 'Controller', __filename, 'Removed all reviews for the product');
					res.send(responseGenerator.generate(false, 'Removed all reviews for the product', product));
				}
			}
		});
	});



	/**
		route for the sub-document level
		1.unrestricted route for viewing all reviews of a product
		2.registered user can only add a review to a product, after review is added, 
		  the average rating is calculated for the product using aggregation and it is updated for the product
		3.admin user can delete all reviews of a product at once
	**/
	productRouter.route(':/productId/reviews/:reviewId');

	app.use('/products', productRouter);
}

module.exports.controller = productController;