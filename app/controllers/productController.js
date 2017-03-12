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
	//in this route we are just interested in the list of products, so not fetching the reviewer's details
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
	//in this route as well not fetching the reviewer's details
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
		products.findById(req.params.productId, {reviews:1, _id:0}).populate('reviews.postedBy', {password:0}).exec((err, data) => {
			if(err) {
				customLogger('Error', 'Controller', __filename, err.stack);
        		errResponse = responseGenerator.generate(true, err.message, 500, null);
        		next(errResponse);
			} else {
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
			postedBy : req.session.user._id,
			comment  : req.body.comment,
			ratings  : req.body.ratings,
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
					products.getAvgRatings(product._id, (avgRating) => {
						products.findByIdAndUpdate(product._id, {ratings:avgRating}, {new:true}, (err, updatedProduct) => {
							if(err) {
								customLogger('Error', 'Controller', __filename, err.stack);
	        					let errResponse = responseGenerator.generate(true, err.message, 500, null);
	        					next(errResponse);		
							} else {
								customLogger('Info', 'Controller', __filename, 'Updated the product with average ratings');
								res.send(responseGenerator.generate(false, 'Added review and updated the product with average ratings', 200, updatedProduct));
							}
						});
					});
				}
			}
		});
	})
	.delete(auth.checkAdmin, (req, res, next) => {
		let errResponse;
		products.findByIdAndUpdate(req.params.productId, {"reviews":[], "ratings":0}, {new:true}, (err, product) => {
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
		route for the nested sub-document level
		1.unrestricted route for viewing a specific review of a product, it involves fetching all the details of it, including the user details
		2.registered user can only modify the review to a product, after review is updated, 
		  the average rating is calculated for the product using aggregation and it is updated for the product
		3.registered user can delete a specific review of a product at once and then aggregation query is performed to update avg ratings
		4.for points 2 and 3, the operations could be performed only by the user to which the review belongs.
	**/
	productRouter.route('/:productId/reviews/:reviewId')
	.get((req, res, next) => {
		let errResponse;
		products.findById(req.params.productId).populate('reviews.postedBy').exec((err, product) => {
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
					let review = product.reviews.id(req.params.reviewId);
					if(!review) {
						customLogger('Error', 'Controller', __filename, 'Review not found');
						errResponse = responseGenerator.generate(true, 'Review not found', 404, null);
						next(errResponse);
					} else {
						customLogger('Info', 'Controller', __filename, 'Fetched a particular review for the product');
						res.send(responseGenerator.generate(false, 'Fetched a particular review for the product', 200, review));
					}
				}
			}
		});
	})
	.put(auth.checkLoggedIn, (req, res, next) => {
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
					let review = product.reviews.id(req.params.reviewId);
					if(!review) {
						customLogger('Error', 'Controller', __filename, 'Review not found');
						errResponse = responseGenerator.generate(true, 'Review not found', 404, null);
						next(errResponse);
					} else {
						console.log('user id', req.session.user._id);
						console.log('postedBy', review);
						if(req.session.user._id == review.postedBy) {
							let review = product.reviews.id(req.params.reviewId);
							req.body.comment ? (review.comment = req.body.comment) : '';
							req.body.ratings ? (review.ratings = req.body.ratings) : '';
							product.save((err, resp) => {
								if(err) {
									customLogger('Error', 'Controller', __filename, err.stack);
									errResponse = responseGenerator.generate(true, err.message, 500, null);
									next(errResponse);
								} else {
									products.getAvgRatings(product._id, (avgRating) => {
										product.ratings = avgRating;
										product.save({"reviews":1},(err, data) => {
											if(err) {
												customLogger('Error', 'Controller', __filename, err.stack);
												errResponse = responseGenerator.generate(true, err.message, 500, null);
												next(errResponse);
											} else {
												customLogger('Info', 'Controller', __filename, 'Edited a particular review for the product and updated the ratings');
												res.send(responseGenerator.generate(false, 'Edited a particular review for the product and updated the ratings', 200, data.reviews.id(req.params.reviewId)));
											}
										});
									});			
								}
							})
						} else {
							customLogger('Error', 'Controller', __filename, 'You are not authorised to edit it');
							errResponse = responseGenerator.generate(true, 'You are not authorised to edit it', 403, null);
							next(errResponse);
						}
					}
				}
			}
		});
	})
	.delete(auth.checkLoggedIn, (req, res, next) => {
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
					let review = product.reviews.id(req.params.reviewId);
					if(!review) {
						customLogger('Error', 'Controller', __filename, 'Review not found');
						errResponse = responseGenerator.generate(true, 'Review not found', 404, null);
						next(errResponse);
					} else {
						if(req.session.user._id == review.postedBy) {
							review.remove();
							product.save((err, data) => {
								if(err) {
									customLogger('Error', 'Controller', __filename, err.stack);
									errResponse = responseGenerator.generate(true, err.message, 500, null);
									next(errResponse);
								} else {
									products.getAvgRatings(product._id, (avgRating) => {
										product.ratings = avgRating;
										product.save((err, resp) => {
											if(err) {
												customLogger('Error', 'Controller', __filename, err.stack);
												errResponse = responseGenerator.generate(true, err.message, 500, null);
												next(errResponse);
											} else {
												customLogger('Info', 'Controller', __filename, 'Deleted a particular review for the product and updated avg ratings');
												res.send(responseGenerator.generate(false, 'Deleted a particular review for the product and updated avg ratings', 200, resp.reviews));
											}
										});
									});			
								}
							});
						} else {
							customLogger('Error', 'Controller', __filename, 'You are not authorised to delete it');
							errResponse = responseGenerator.generate(true, 'You are not authorised to delete it', 403, null);
							next(errResponse);
						}
					}
				}
			}
		});
	});


	app.use('/products', productRouter);
}

module.exports.controller = productController;