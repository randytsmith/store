'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Order = mongoose.model('Order');

// api/users/:id
router.param('id', function(req, res, next, id){
	User.findById(id)
	.then(function(user){
		req.reqUser = user; 
		next();
	})
	.then(null, next)
});

//get all users
router.get('/', function(req, res, next) {
	User.find(req.query)
	.then(function(response){
		res.json(response);
	})
	.then(null, next);
});

//get one
router.get('/:id', function(req, res, next) {
	res.json(req.reqUser);
});

//update one
router.put('/:id', function (req, res, next) {
	User.findById(req.reqUser._id)
	.then(function(user){
		user.set(req.body);
		return user.save();
	})
	.then(function(updatedUser) {
		res.json(updatedUser);
	})
	.then(null, next);
});

// api/:id/orders routes...

// get one user's orders
router.get('/:id/orders', function(req, res, next) {
	Order.findByUser(req.reqUser._id)
	.then(function(orders){
		res.json(orders);
	})
	.then(null, next);
});

//get past orders // update later to use req.query? ?status=complete
router.get('/:id/pastOrders', function(req, res, next) {
	Order.findByUser(req.reqUser._id, "complete")
	.then(function(pastOrders){
		res.json(pastOrders);
	})
	.then(null, next);
});

//view current (inProgress) order; if there isn't one, create a new order
router.get('/:id/cart', function(req, res, next) {
	Order.findOrCreate(req.reqUser._id)
	.then(function(cart) {
		res.json(cart);
	})
	.then(null, next);
});

// remove one item from order
router.delete('/:id/cart/items', function(req, res, next){
	Order.findByUser(req.reqUser, "inProgress")
	.then(function(currentCart){
		return currentCart[0].removeItem(req.body.itemId);
	})
	.then(function(updatedCart){
		res.json(updatedCart);
	})
});

// add item to order, if no current order, create one and then add item.
router.post('/:id/cart/items', function(req, res, next) {
	Order.findOrCreate(req.reqUser._id)
	.then(function(cart) {
		return cart.addItem(req.body);
	})
	.then(function(updatedCart) {
		res.json(updatedCart);
	})
	.then(null, next);
});
