const express = require('express')
const dotenv =	require('dotenv').config()
const mongoose =require('mongoose')
const dbmodel = require('./models.js')
const shortid = require('shortid');
const Joi =	 require("@hapi/joi")

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())

// JOI SCHEMA
const schema = Joi.object().keys({
    longurl :Joi.string().min(5).max(100).trim().required(),
    shorturl :Joi.string().min(3).max(20).trim().required(),
});

// DB CONNECTION
mongoose.connect(process.env.MONGODB_URI, 
	{dbName:'linkIt',useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;

db.on('error', ()=>console.log("DB Connection Error"));
db.once('open',()=>console.log('Connction DB Done'));


// routes

app.get('/',(req,res)=>{
	res.json({
		Name:"Link-it",
		Status :"Active"
	})
})

app.post('/gen',(req,res)=>{
	let longurl = req.body.longurl;

	const urlobj = {
		longurl : longurl,
		shorturl : shortid.generate()
	}
	let s_val = schema.validate(urlobj)
	if(s_val['error'] == null){
		let newurlobj = new dbmodel(urlobj)
		newurlobj.save((err,result)=>{
			if(err){
				res.json(err)
			}
			else{
				res.json(result)
			}
		})
	}

	else{
		res.json(s_val['error']["details"][0])
	}

})

app.listen(port,()=>console.log(`listening in ${port}`))