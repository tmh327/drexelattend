//Timer for error message
var myTimer;

/////////////////////
// OBTAIN URL INFO //
/////////////////////

//Determine professor ID from URL
/*
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
*/

//////////////////////////
// BUTTON FUNCTIONALITY //
//////////////////////////

//Submit data after validation
document.getElementById("buttonSubmit").addEventListener("click", validateData);

//Redirect user to professor hub page
document.getElementById("buttonReturn").addEventListener("click", function(){
	document.location.href='student.html';
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
			document.location.href='student.html';
		}
	}
	
	//Prep Query String
	let queryString = getQueryFromInputs();
	
	//Prep URL for new class
	let URL = "http://localhost:8080/student";
	xhttp.open("POST",URL);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send(queryString);
}

///////////////////////////
// GET STUDENTS POSITION //
///////////////////////////

let lon, lat;
function getPosition(pos){
    lon = pos.coords.longitude;
    lat = pos.coords.latitude;
}


function error(){
    document.getElementById("error").innerHTML = "Server cannot get your location";
}

///////////////////////////
// VALIDATE USER ENTRIES //
///////////////////////////

function validateData(){
    navigator.geolocation.getCurrentPosition(getPosition,error);
    console.log("getting device's position");
    //Prepare for data validation! Error code is 0 by default.
	var errorCode = 0;
	
	//Are the class name, class section, and location boxes filled out?
	var userClassName = document.getElementById("classNameInput").value.trim();
	var userSection = document.getElementById("classSectInput").value.trim();
	
	
	if (userClassName == ""){
		console.log("User Class Name Error");
		errorCode = 1;
	}
	
	if (userSection == ""){
		console.log("User Section Error");
		errorCode = 1;
    }
    if (errorCode != 0){
		throwError(errorCode);
	}else{
		request();
	}
}

//Package user entries for server
function getQueryFromInputs(){
	rv = {};
	//Get Student Name
	rv.student_id = document.getElementById("studentNameInput").value.toString();

    //Get Class Name
    rv.class_name = document.getElementById("classNameInput").value.toString();

    //Get Section
	rv.class_sect = document.getElementById("classSectInput").value.toString();
	
	//Get Location
	rv.loc = [lat, lon];
	
	//Get Day and Time
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    var day = today.getDay(); //integer Sun - Sat: 0 - 6

    rv.timestamp = time + "-" + day;
	
	return JSON.stringify(rv);
}