//Timer for error message
var myTimer;

/////////////////////
// OBTAIN URL INFO //
/////////////////////

//Determine professor ID from URL
var profID = getQueryVariable("profid");

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

//////////////////////////
// BUTTON FUNCTIONALITY //
//////////////////////////

//Submit data after validation
document.getElementById("buttonSubmit").addEventListener("click", validateData);

//Redirect user to professor hub page
document.getElementById("buttonReturn").addEventListener("click", function(){
	document.location.href='professorhub.html?profid=' + profID.toString();
});


////////////////////////
// SERVER INTERACTION //
////////////////////////

function request(){
	//Form new xhttp request
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			//Redirect user upon response
			document.location.href='professorhub.html?profid=' + profID.toString();
		}
	}
	
	//Prep Query String
	let queryString = getQueryFromInputs();
	
	//Prep URL for new class
	let URL = "http://localhost:8080/newClass";
	xhttp.open("POST",URL);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send(queryString);
}

///////////////////////////
// VALIDATE USER ENTRIES //
///////////////////////////

function validateData(){
	//Prepare for data validation! Error code is 0 by default.
	var errorCode = 0;
	
	//Are the class name, class section, and location boxes filled out?
	var userClassName = document.getElementById("classNameInput").value.trim();
	var userSection = document.getElementById("classSectInput").value.trim();
	var userLocation = document.getElementById("classLocInput").value.trim();
	
	
	if (userClassName == ""){
		console.log("User Class Name Error");
		errorCode = 1;
	}
	
	if (userSection == ""){
		console.log("User Section Error");
		errorCode = 1;
	}
	
	if (userLocation == ""){
		console.log("User Location Error");
		errorCode = 1;
	}
	
	//Check that time entered is valid:
	var userStHr = document.getElementById("startHrInput").value.trim();
	var userEndHr = document.getElementById("endHrInput").value.trim();
	var userStMin = document.getElementById("startMinInput").value.trim();
	var userEndMin = document.getElementById("endMinInput").value.trim();
	
	if (!between(userStHr, 0, 23) || !between(userEndHr, 0, 23) || !between(userStMin, 0, 59) || !between(userEndMin, 0, 59)){
		console.log("Time not Valid Error");
		errorCode = 2;
	}else{
		var userStHr = parseInt(userStHr);
		var userStMin = parseInt(userStMin);
		var userEndHr = parseInt(userEndHr);
		var userEndMin = parseInt(userEndMin);
		
		if (userStHr > userEndHr){
			console.log("Bad Timeslot Error");
			errorCode = 2;
		}else if (userStHr == userEndHr){
			if (userStMin >= userEndMin){
				console.log("Bad Timeslot Error");
				errorCode = 2;
			}
		}
	}
	
	//Check that at least one day is selected
	var days = document.querySelectorAll(".dayCheck");
	var haveADay = false;
	for (var x = 0; x < days.length; x++){
		if (days[x].checked == true){
			haveADay = true;
		}
	}	
	
	if (!haveADay){
		errorCode = 3;
	}
	
	//Throw an error if the error code isn't zero; otherwise send the class data
	if (errorCode != 0){
		throwError(errorCode);
	}else{
		request();
	}
}

function throwError(code){
	//Show a different error message depending on error code
	var msg = "";
	switch(code){
		case 1:
			msg = "You must enter a class name, section, and location!";
			break;
			
		case 2:
			msg = "You must enter a valid timeslot, with times written as values from 00:00 - 23:59.";
			break;
			
		case 3:
			msg = "Every class must occur on at least one weekday.";
			break;
	}
	
	var messageArea = document.getElementById("error");
	messageArea.innerHTML = msg;
	clearTimeout(myTimer);
	myTimer = setTimeout(function() {
		messageArea.innerHTML = " ";
	}, 5000);
}

function between(x, min, max) {
	//Returns true if x is a number between min and max (inclusive)
	if (isNaN(parseInt(x))){
		console.log("Non number between");
		return false;
	}
	return (min <= parseInt(x) && max >= parseInt(x))
}

//Package user entries for server
function getQueryFromInputs(){
	rv = {};
	//Get Name
	rv.name = document.getElementById("classNameInput").value.toString();
	
	//Get Section
	rv.sect = document.getElementById("classSectInput").value.toString();
	
	//Get Location
	rv.loc = document.getElementById("classLocInput").value.toString();
	
	//Get Times
	let startHr = document.getElementById("startHrInput").value.toString().padStart(2, "0");
	let startMin = document.getElementById("startMinInput").value.toString().padStart(2, "0");
	let endHr = document.getElementById("endHrInput").value.toString().padStart(2, "0");
	let endMin = document.getElementById("endMinInput").value.toString().padStart(2, "0");
	rv.time = startHr + ":" + startMin + "-" + endHr + ":" + endMin;
	
	//Get Days
	myCheckboxes = document.querySelectorAll(".dayCheck");
	myDays = "";
	for (let x=0; x < myCheckboxes.length; x++){
		if (myCheckboxes[x].checked == true){
			myDays += 1;
		}else{
			myDays += 0;
		}
	}
	rv.days = myDays;
	
	//Set professor ID
	rv.profID = profID;
	
	return JSON.stringify(rv);
}