var express=require('express'),
app=express(),
ejs=require('ejs'),
mongoose=require('mongoose'),
passport=require('passport'),
jwt=require('jsonwebtoken'),
bodyParser = require('body-parser'),
expressSessions = require('express-sessions'),
LocalStrategy=require('passport-local');

User=require('./models/user');
Book=require('./models/book');
Issue=require('./models/issue');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));


var cors = require('cors');
app.use(cors());


mongoose.connect('mongodb+srv://test:test@cluster0.lq9vw.mongodb.net/libmngmtsys?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology:true});
var db=mongoose.connection;
db.on('open',function(err){
	console.log("connected to db");
});

app.post("/login",function(req,res){
	const user = new User({
	  username:req.body.username,
	  password:req.body.password
	});
	req.login(user, function(err){
	  if(err){
		console.log(err);
		res.status(400).send(err);
	  } else {
		  console.log("in");
		passport.authenticate("local")(req,res,function(){
			if(err)
				res.status(401).send(err)
			else{
			User.findOne({username:user.username},function(err,u){
				console.log(u)

				res.send({"token":jwt.sign({user:u},'key')});
			});
		  
			}
		  

		}); 
	  }
	});
  });
  


User=require('./models/user');
Book=require('./models/book');
Issue=require('./models/issue');

app.use(require('express-session')({
    secret: "sih2020",
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var date = new Date(8/8/2020);
var h = date.getHours();
var m = date.getMinutes();
var s = date.getSeconds();

const retriveUser=(req,res,next)=>{
	const token=req.headers.authorization;
	
	jwt.verify(token,'key',function(err,user){
		
		req.user=user
		
	});
	next();
}


  app.get("/profile",retriveUser,function(req,res){
	  if(req.isAuthenticated()){
		  const user = req.user;
		  console.log(user);
		res.send(user);
	 }

  });
	app.get("/issued",retriveUser,function(req,res){
		if(req.isAuthenticated()){
			const user = req.user.user.username;
			console.log(req.user,req.user.user.username)
			Issue.find({username: user},function(err,books){
				if(err){
					console.log(err);
				}else{
					if(books){
						res.send(books);
					}
				}
			})
		}
	})



app.post("/issueapi",retriveUser,function(req,res){
	console.log(req.body,req.accno);
	var name;

	Book.findOne({AccNo:req.body.accno} ,function(err,re){
		name=re.name

	var newissue = new Issue({
		AccNo: req.body.accno,
		username: req.user.user.username,
		name:name
	})


	if(!req.user||(!req.body.accno)){
	return res.status(401).send("unauthorized")
	}

	Book.findOneAndUpdate({AccNo:req.body.accno},{Status:"Issued"},function(err,book){
		if(err){
			console.log(err);
		}

		else if(book.Status=="Issued")
		res.status(401).send("already issued");
	else{
	newissue.save(function(err){
		if(err){
			console.log(err);
			res.status(400).send({err:err});
		}
		else if(!book)
		res.status(404).send("No such book Found");
		else{
			if(book.Status=="Available")
			res.status(200).send({status:"issued",book:book});
			else
			res.status(401).send("already issued");
		}
	});
	}

	})
	});




});
app.post("/search",function(req,res){
	const book = req.body.bname;
	const author = req.body.aname;
	if(!book){
		if(!author){
			Book.find({},function(err,found){
				if(err){
					console.log(err);
				}else{
					if(found){
						res.send(found);
					}else{
						res.send("No book found");
					}
				}
			})
		}else{
			Book.find({author:new RegExp(author,'i') },function(err,found){
				if(err){
					console.log(err);
				}else{
					if(found){
						res.send(found)
					}else{
						res.send("No book found");
					}
				}
			})
		}

	}else if (!author) {
		Book.find({name:new RegExp(book,'i')},function(err,found){
			if(err){
				console.log(err);
			}else{
				if(found){
					res.send(found)
				}else{
					res.send("No book found");
				}
			}
		})
	}
		else{
		Book.find({name:new RegExp(book,'i'),author:new RegExp(author,'i')},function(err,found){
			if(err){
				console.log(err);
			}else{
				if(found){
					res.send(found)
				}else{
					res.send("No book found");
				}
			}
		})
	}
})


	


app.listen(process.env.PORT||2000,function(err){
	if(err)
		console.log(err);
	else
		console.log("Serving on port 2000",process.env.PORT);
});
