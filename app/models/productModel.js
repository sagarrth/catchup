const mongoose 			= 	require('mongoose');
const customLogger 		= 	require('./../../libs/customLogger');
const responseGenerator = 	require('./../../libs/responseGenerator');

const ReviewsSchema = new mongoose.Schema({
	postedBy : 	{type:mongoose.Schema.Types.ObjectId, ref:'User'},
	comment  :  {type:String, required:true},
	ratings  : 	{type:Number, default:0, min:0, max:5},
}, {
	timestamps : true
});


const ProductSchema = new mongoose.Schema({
	name		 : {type:String, required:true},
	description  : {type:String, required:true},
	category	 : {type:String, required:true},
	manufacturer : {type:String, require:true},
	img_url      : {type:String},
	price		 : {type:Number, required:true},
	ratings      : {type:Number, default:0, min:0, max:5},
	reviews		 : [ReviewsSchema]
},{
	timestamps: true
});


ProductSchema.statics.getAvgRatings = function(id, cb){
	let errResponse;
	productModel.aggregate(
		{$match: {_id: id}},
		{$project: {_id:0, "reviews.ratings":1}},
		{$unwind:"$reviews"},
		{$group: {_id:null, avgRating:{$avg:"$reviews.ratings"}}}
	).exec((err, resp) => {
		if(err) {
			customLogger('Error', 'Model', __filename, err.stack);
			errResponse = responseGenerator.generate(true, err.message, 500, null);
			next(errResponse);
		} else {
			customLogger('Info', 'Model', __filename, 'Aggregation query successfully performed to get average ratings');
			cb(resp[0].avgRating);
		}
	});
}

const productModel = mongoose.model('Product', ProductSchema);

module.exports = productModel;