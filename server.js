var express=require('express'),
app=express(),
ejs=require('ejs'),
mongoose=require('mongoose'),
passport=require('passport'),
bodyParser = require('body-parser'),
expressSessions = require('express-sessions'),
LocalStrategy=require('passport-local');

mongoose.connect('mongodb+srv://test:test@cluster0.lq9vw.mongodb.net/libmngmtsys?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology:true});
var db=mongoose.connection;
db.on('open',function(err){
	console.log("connected to db");
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
app.get('/',function(req,res){
	res.render('index');
});

app.get('/login',function(req,res){
	res.render('login');
});


app.get('/register',function(req,res){
	res.render('register');
});

app.get('/issue',function(req,res){
	if (req.isAuthenticated()) {
		res.render('issue',{req});
	}else {
		res.redirect("/login");
	}

});
app.get("/dashboard",function(req,res){
	if (req.isAuthenticated()) {
		res.render('dashboard');
	}else{
		res.redirect("/login");
	}
})

app.post('/register',function(req,res){
	User.register(new User({'name':req.body.name,'username':req.body.username,'email':req.body.email,'DOB':req.body.DOB,'rollno':req.body.rollno}),req.body.password,function(err){
		if(err)
			console.log(err);
		else{
			passport.authenticate("local")(req,res,function()
			{
				console.log('registered');
				res.render('thankyou');
			});
	}}
	);
});

app.get("/all_users",function(req,res){
	User.find({},function(err,users){
		if(!err)
		res.send(users);
		else
		res.send("err occured");
});
});

app.post("/login",function(req,res){
	const user = new User({
	  username:req.body.username,
	  password:req.body.password
	});
	req.login(user, function(err){
	  if(err){
		console.log(err);
		res.redirect("/login");
	  } else {
		passport.authenticate("local") (req,res,function(){
		  res.render("dashboard");

		});
	  }
	});
  });
  app.get("/profile",function(req,res){
	  if(req.isAuthenticated()){
		  const user = req.user;
		  console.log(user);
		res.render("profile",{user:user});

	  }else{
		  res.redirect("/login")
	  }

  });
	app.get('/logout',function(req,res){
	    req.session.destroy(function(err){
	        if(err){
	            console.log(err);
	        }
	        else
	        {
	            res.redirect('/');
	        }
	    });

	});
	app.get("/issued",function(req,res){
		if(req.isAuthenticated()){
			const user = req.user.username;
			Issue.find({username: user},function(err,books){
				if(err){
					console.log(err);
				}else{
					if(books){
						res.render('issued',{found:books});
					}
				}
			})
		}
	})


app.post("/issue",function(req,res){
	var newissue = new Issue({
		AccNo: req.body.accno,
		username: req.user.username
	});

	if(!req.user||(!req.body.accno)){
	return res.status(401).send("unauthorized")
	}

	Book.findOne({AccNo:req.body.accno},function(err,re){
	if((!re)||re.Status=="Issued")
	return res.status(401).send("Alredy Issued");
	});
	Book.findOneAndUpdate({AccNo:req.body.accno},{Status:"Issued"},function(err){
		if(err){
			console.log(err);
			res.status(400).send({err:err});
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

app.post("/issueapi",function(req,res){
	console.log(req.body,req.accno);
	var name;

	Book.findOne({AccNo:req.body.accno} ,function(err,re){
		name=re.name

	var newissue = new Issue({
		AccNo: req.body.accno,
		username: req.user.username,
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

app.get("/book",function(req,res){
	res.render("book");
});

app.post("/book",function(req,res){
	var newbook = new Book({
		name :req.body.name,
		author :req.body.author,
		ISBN : req.body.ISBN,
		ShelfNo : req.body.ShelfNo,
		AccNo : req.body.AccNo,
		publisher : req.body.publisher,
		category : req.body.category
	});
	newbook.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.render("thankyou");
		}
	})
});
app.get("/search",function(req,res){
	res.render("search");
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
						res.render('find',{found:found})
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
						res.render('find',{found:found})
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
					res.render('find',{found:found})
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
					res.render('find',{found:found})
				}else{
					res.send("No book found");
				}
			}
		})
	}
})

app.get("/deposit",function(req,res){
	res.render("deposit");
});

app.post("/deposit",function(req,res){
	const d = req.body.accno;
     Issue.deleteOne({AccNo: d},function(err){
		 if(err){
			 console.log(err);
			res.status(400).send({err:err});
		 }else{

			 Book.findOneAndUpdate({AccNo:d},{Status:"Available",IssuedTo:" "},function(err,found){
				 console.log("ok");
				 if(err){
					 console.log(err);
				 }
				 console.log(found);
				res.send(found);
			 })

		 }
	 });
});
if(h === 12 && m === 0 && s === 0){
	Issue.find({},function(err,found){
		if(err){
			console.log(err);
		}else{
			if(found){
				console.log(found);
				for(var i=0;i<found.length;i++){
					if(found[i].Due_on > date){
						User.findOneAndUpdate({username:found[i].username},{$inc:{Fine: 1}},function(err,user){
							if(err){
								console.log(err);
							}else{
								if(user){
									console.log(user);
							}
						}
					})
				}
			}
		}else{
			res.send("No books are Issued");
		}
	}})
}

app.listen(process.env.PORT||2000,function(err){
	if(err)
		console.log(err);
	else
		console.log("Serving on port 2000",process.env.PORT);
});
