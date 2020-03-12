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
app.use(express.static("./professorhub"));

let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//import request
let request = require("request");

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