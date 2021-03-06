//////////////////
// REQUIREMENTS //
//////////////////

//import key
//let myKey = require("../sqlinfo.json");

//import database and login info
let mysql = require('mysql');
let con = mysql.createConnection({
	'host': 'localhost',
	'user': 'root',
	'password': '12345678',
	'database': 'drexel_attend'
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

let settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://us1.locationiq.com/v1/search.php?key=YOUR_PRIVATE_TOKEN&q=Empire%20State%20Building&format=json",
  "method": "GET"
}

//POST for making new attendance instance
app.post("/student", function(req,res) {	
  let classid; 
  let class_geo;
  var myQuery = "SELECT class_id, timeframe, loc FROM classes WHERE name='"+ req.body.class_name + "' AND section='" + req.body.class_sect+"'";
  con.query(myQuery, function(err, result) {
    if (err) {
        console.log(err);
        res.send(err);
    }
    else {
      classid = result[0].class_id;
      console.log("found the class " + classid);
      //check if student sign in at right time
      /*
      var studenttime = new Date("01/01/2000 "+req.body.timestamp.split("-")[0]);
      var startime = new Date("01/01/2000 "+result[0].timeframe.split("-")[0]);
      var endtime = new Date("01/01/2000 "+result[0].timeframe.split("-")[1]);
      console.log(studenttime);
      console.log(startime);
      console.log(endtime);
      if (studenttime < startime || studenttime > endtime){ //If student sign in too early/too late
        console.log("You can't sign in now!");
       }
        let class_loc = result[0].loc.split(" ").join("%20");
        settings.url = `https://us1.locationiq.com/v1/search.php?key=10d8c3e14d9a3c&q=${class_loc}&format=json`
        request(settings, function (error, response, body) {
          const json = JSON.parse(body);
          class_geo = [json.lat, json.lon]; 
        });
        if (req.body.loc != class_geo) { //if the student location is not the same as the class room location
          console.log("You are not at the right location!");
          res.status(404)        // HTTP status 404: NotFound
             .send('Not found');
        }
        */
        con.query("INSERT INTO attend (student, class_id) VALUES ('"+req.body.student_id+ "', '" + classid +"');"); 
    }
  });
  	res.send();
});

//GET for getting student attendance
app.get("/attendance", function(req,res){
	con.query('select A.student, C.name, C.section from attend A INNER JOIN classes C on C.class_id = A.class_id WHERE C.class_id= ' + req.query.classid, function(err, rows, fields) {
	if (err) {
		console.log(err);
		res.send(err);
	}
		res.send(JSON.stringify({ "rows": rows }));
	});
});


/////////////////////////
// REGISTER AND LOGIN  //
/////////////////////////

// Server array used for easier handling of userId in req.session
const users = [{id: 0, username:'placeholder', password:'placeholder'}]

// Middleware to direct user to login if the user is not logged in
const redirectLogin = (req,res,next) =>{
  if(!req.session.userId) {
    res.redirect('/login.html')
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
            return res.redirect('/professorhub.html?profid=' + professor_id.toString())
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
            return res.redirect('/login.html')
        } else {
            console.log("There is an account associated with the username.")
            return res.redirect('/register.html')
        }
    }); // End of query
    } else {// End of checking if username and password are entered
        return res.redirect('/register.html')
    }
})

// Logout from session
app.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err){
      return res.redirect('/login.html')
    }
    res.clearCookie()
    res.redirect('/login.html')
  })
})