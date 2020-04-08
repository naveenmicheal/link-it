const mongoose = require('mongoose')

const shorturlschema = mongoose.Schema({
	longurl:{
		type:String,
		required:true,
		unique: true
	},
	shorturl:{
		type:String,
		required:true,
		unique: true
	},

});

module.exports = mongoose.model('shorturl', shorturlschema);