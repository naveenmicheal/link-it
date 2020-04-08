const express = require('express')
const dotenv =	require('dotenv').config()
const mongoose =require('mongoose')
const dbmodel = require('./models.js')
const shortid = require('shortid');
const Joi =	 require("@hapi/joi")
const useragent = require("useragent")

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())

// JOI SCHEMA
const schema = Joi.object().keys({
    longurl :Joi.string().min(5).max(100).trim().required(),
    shorturl :Joi.string().min(3).max(20).trim().required(),
    stats :Joi.array().required(),
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
		shorturl : shortid.generate(),
		stats :[]
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

app.get('/:uid',(req,res)=>{
	const uid = req.params.uid
	const ip = req.connection.remoteAddress
	const raw_agent = useragent.parse(req.headers['user-agent'])
	const parsedagent = raw_agent.toString().split('/')
	const browser = parsedagent[0]
	const os = parsedagent[1]

	// console.log(`IP ${ip}, Agent ${browser}, ${os}`)

	dbmodel.find({shorturl:uid},(err,result)=>{
		if(err){res.json(err)}
		else{
			statobj = {
				ip : ip,
				browser : browser,
				os:os
			}
			dbmodel.updateOne({shorturl:uid},{ $push: { stats: statobj } },(err,sts)=>{
				err ? res.json(err) : res.json(sts)
			})
		}
	})

})



app.listen(port,()=>console.log(`listening in ${port}`))