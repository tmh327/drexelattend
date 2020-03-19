//////////////////
// REQUIREMENTS //
//////////////////

//import key
let myKey = require("../sqlinfo.json");

//import database and login info
let mysql = require('mysql');
let con = mysql.createConnection({
	'host': 'localhost',
	'user': myKey.user,
	'password': myKey.passwd,
	'database': 'drexelattend'
});

//import and initialize express object
let express = require("express");
let app = express();

//Set static path
app.use(express.static("."));
//app.use(express.static("./professorhub"));

let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import request
let request = require("request");
const session = require('express-session')

//Start session
app.use(
  session({
    // Name for the session ID cookie. Defaults to 'connect.sid'.
    name: 'sid', // constant name for session ID cookie
    saveUninitialized: false, // do not force session if the session is unintialized 
    resave: false, // do not allow session to save back to session store if no change
    secret: `MeowMeowMeow`, // huh?
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // specifies when the cookie will expire
      sameSite: true, // browser will only access cookie if in same domain
     //secure: process.env.NODE_ENV === 'production'
    } //end of cookie
  })
)

///////////////////////////////////////////
// OPEN LOCAL PORT & CONNECT TO DATABASE //
///////////////////////////////////////////

//Begin listening on port 8080...
app.listen(8080, function() {
	console.log("Server started on port 8080...");
});

//Connect to database
con.connect(function(err) {
	if (err) {
		console.log(err);
	}else{
		console.log("Database successfully connected.");
	}	
});

/////////////////////////
// WEBPAGE INTERACTION //
/////////////////////////

//GET for getting info for particular class
app.get("/getclassbypin", function(req,res){
	con.query('SELECT class_id, classes.name, section, loc, timeframe, days, professor_id from classes where class_id = ' + req.query.id, function(err, rows, fields) {
	if (err) {
		console.log(err);
		res.send(err);
	}
		res.send(JSON.stringify({ "classes": rows }));
	});
});

//GET for getting classes
app.get("/getclasses", function(req,res){
	con.query('SELECT class_id, classes.name, section, loc, timeframe, days, professor_id from classes where professor_id = ' + req.query.id, function(err, rows, fields) {
	if (err) {
		console.log(err);
		res.send(err);
	}
		res.send(JSON.stringify({ "rows": rows }));
	});
});


//POST for making classes
app.post("/newClass", function(req,res){	
	var days = "";
	for(var x = 0; x < req.body.days.length; x++){
		days += req.body.days[x].toString();
	}
	
	con.query("INSERT INTO classes ( name, section, loc, timeframe, days, professor_id ) VALUES ( '" + req.body.name + "', '" + req.body.sect + "', '" + req.body.loc + "', '" + req.body.time + "', '" + days + "', '" + req.body.profID + "' );", function(err, rows, fields) {
	if (err) {
		console.log(err);
	}
	});
	res.send();
});

//POST for editing existing classes
app.post("/editClass", function(req,res){

	var myQuery = "UPDATE classes SET";
	myQuery += " name = '" + req.body.name;
	myQuery += "', section = '" + req.body.sect;
	myQuery += "', loc = '" + req.body.loc;
	myQuery += "', timeframe = '" + req.body.time;
	myQuery += "', days = '" + req.body.days;
	
	myQuery += "' WHERE class_id = " + req.body.id + ";";
	
	con.query(myQuery, function(err, rows, fields) {
	if (err) {
		console.log(err);
	}
	});
	
	res.send();
});

//POST for deleting existing classes
app.post("/deleteClass", function(req,res){

	var myQuery = "DELETE FROM classes WHERE class_id = " + req.body.id + ";";
	
	con.query(myQuery, function(err, rows, fields) {
	if (err) {
		console.log(err);
	}
	});
	
	res.send();
});

/////////////////////////
// REGISTER AND LOGIN  //
/////////////////////////

// Server array used for easier handling of userId in req.session
const users = [{id: 0, username:'placeholder', password:'placeholder'}]

// Middleware to direct user to login if the user is not logged in
const redirectLogin = (req,res,next) =>{
  if(!req.session.userId) {
    res.redirect('/login')
  } else {
    next()
  }
}

// Middleware to direct user to home or other page if the user is logged in
const redirectHome = (req,res,next) =>{
  if(!req.session.userId) {
    res.redirect('/home')
  } else {
    next()
  }
}


// Middleware to get userId from req.session. userId indicates if the user is logged in.
app.use((req,res,next)=>{
   const { userId } =req.session
   if (userId){res.locals.user = users.find(user=>user.id ===userId)} 
   next()
 })

app.get('/home', redirectLogin, (req, res) => {
  const { user } = res.locals;
  res.send(`<h1>Home</h1>
    <a href='/'>Main</a>
    Username: ${user.username}`)
})

// Process login info
app.post('/login', (req, res) => {
    const { username, password } = req.body
    if(username && password) {
    var myQuery = "SELECT * FROM professors WHERE username='"+ req.body.username + "' AND password='" + req.body.password+"'";
    con.query(myQuery, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        if (rows[0]){
            console.log(rows[0].professor_id)
            professor_id = rows[0].professor_id;
            req.session.userId = professor_id;

            //pushing to the users array
            const user = {
            id: professor_id,
            username,
            password
            }
            users.push(user)
            return res.redirect('/home.html')
        }; // End of checking if the retrieved data is undefined
    });// End of query
    } else {
        return res.redirect('/login.html') 
    }// End of checking input
})

// Process register info
app.post('/register', (req, res) => {
  const { username, password } = req.body
  if(username && password) {
    //const exists = users.some(user => user.username === username)
    var myQuery = "SELECT * FROM professors WHERE username='"+ req.body.username + "'";
    con.query(myQuery, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.send(err);
        }
    // If there is no such username
        if (!rows[0]){
            console.log("We can register this person.")
            // Insert into database
            var myQuery = "INSERT INTO professors (username, password) VALUES ('"+req.body.username+ "', '" +req.body.password+"');";
            con.query(myQuery, function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.send(err);
                };
                console.log(rows)
            });// End of inserting new user
            return res.redirect('/login')
        } else {
            console.log("There is an account associated with the username.")
            return res.redirect('/register')
        }
    }); // End of query
    } else {// End of checking if username and password are entered
        return res.redirect('/register')
    }
})

// Logout from session
app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err){
      return res.redirect('/home')
    }
    res.clearCookie()
    res.redirect('/login')
  })
})