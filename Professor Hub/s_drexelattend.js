//////////////////
// REQUIREMENTS //
//////////////////

//import key
let myKey = require("../sqlinfo.json");

//import database
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

/////////////////////
// OPEN LOCAL PORT //
/////////////////////

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

//Gives HTML response for editing a class
app.get("/editClass", function(req,res){
	var classID = req.query.id;
	
	con.query('SELECT class_id, classes.name, section, loc, timeframe, days, professor_id from classes where class_id = ' + classID, function(err, rows, fields) {
		if (err) {
			console.log(err);
			res.send(err);
		}
		
		let rv = '<!DOCTYPE html>';
		rv += '<html lang="en">'
		rv += '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
		rv += '<script src="editclass.js" defer></script>';
		rv += '<title>Edit Class</title>';
		rv += '</head>';
		rv += '<body>';
		rv += '<h1>Editing Class with PIN#:<div id="pin">' + classID.toString() + '</div></h1>';
		rv += '<div id="error"></div>';
		rv += '<button type="button" id="buttonSubmit">Submit</button>';
		rv += '<button type="button" id="buttonReturn">Return to Hub Page</button>';
	
		var myClass = null;
		
		if (rows[0] != null){
			myClass = rows[0];
		}		
		
		if (myClass == null){
			res.send("Error 404: Class " + classID.toString() + " not found.");
		}else{
			rv += '<p>Class Name</p>';
			rv += '<input type="text" name="classNameInput" id="classNameInput" placeholder="Enter Class Name Here" value="' + myClass.name + '">';
			
			rv += '<p>Class Section</p>';
			rv += '<input type="text" name="classSectInput" id="classSectInput" placeholder="Enter Class Section Here" value="' + myClass.section + '">';
			
			rv += '<p>Location</p>';
			rv += '<input type="text" name="classLocInput" id="classLocInput" placeholder="Enter Class Location Here" value="' + myClass.loc + '">';
			
			var myTimes = myClass.timeframe.split(/-|:/);
			
			rv += '<p>Class Time</p>';
			rv += '<input type="text" name="startHrInput" id="startHrInput" placeholder="Start Hour" value="' + myTimes[0].padStart(2, "0") + '">';
			rv += ':';
			rv += '<input type="text" name="startMinInput" id="startMinInput" placeholder="Start Minute" value="' + myTimes[1].padStart(2, "0") + '">';
			rv += '>>>';
			rv += '<input type="text" name="endHrInput" id="endHrInput" placeholder="End Hour" value="' + myTimes[2].padStart(2, "0") + '">';
			rv += ':';
			rv += '<input type="text" name="endMinInput" id="endMinInput" placeholder="End Minute" value="' + myTimes[3].padStart(2, "0") + '">';
			
			rv += '<p>Days</p>';
			var dayIDs = ["checkM", "checkTu", "checkW", "checkTh", "checkF"];
			var dayLabels = ["Monday (M)", "Tuesday (T)", "Wednesday (W)", "Thursday (Th)", "Friday (F)"]
			for(var x=0; x < 5; x++){
				rv += '<p><input type="checkbox" name="' + dayIDs[x] + '" class="dayCheck"';
				if(myClass.days[x] == 1){
					rv += ' checked="true">';
				}else{
					rv += '>';
				}
				rv += '<label for="' + dayIDs[x] + '">' + dayLabels[x] + '</label></p>';
			}
			rv += '</body></html>';
			res.send(rv);
		}
	});
});

///////////////
// FUNCTIONS //
///////////////

