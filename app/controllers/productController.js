const express = require('express');
const mongoose = require('mongoose');
const products = require('./../models/productModel');
const validate = require('./../../middleware/validator');
const router  = express.Router();

function productController(app){

	/**
		route for the collection level
		1.admin access is to add a product, or dropping the entire products collection
		2.unrestricted route for viewing the list of products
	**/
	router.route('/')
	.get((req, res, next) => {
		products.find({}, (err, data) => {
			if(err) throw err;
			res.json(data);
		});
	})
	.post(auth.checkUser, validate('product'), (req, res, next) => {
		let newProduct = {
			name: req.body.name,
			description : req.body.description,
			category : req.body.category,
			price : req.body.price
		};
		req.body.img_url?(newProduct["img_url"]=req.body.img_url):'';
		products.create(newProduct, (err, data) => {
			if(err) throw err;
			res.json(data);
		});
	})
	.delete(auth.checkUser, (req, res, next) => {
		products.remove((err, data) => {
			if(err) throw err;
			res.json(data);
		});
	});

	//route to get all products
	router.get('/', (req, res, next) => {

	});

	//route for adding products
	router.post('/add', validator, (req, res, next) => {

	});

	//route for deleting products
	router.delete('/remove', (req, res, next) => {

	});

	app.use('/products', router);
}

module.exports.controller = productController;