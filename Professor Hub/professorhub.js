var profID = getQueryVariable("profid");
request();
updateID();
document.getElementById("createClass").href = "http://localhost:8080/createclass.html?profid=" + profID.toString();

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

function request(){
	//Form new xhttp request
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			//Upon reception of response, distribute received info
			parseClasses(JSON.parse(xhttp.responseText));
		}
	}
	
	//Prep and send URL with latitude and logitude data
	let URL = "./getclasses?id=" + profID.toString();
	xhttp.open("GET",URL,true);
	xhttp.send();
}

function parseClasses(classJSON){
	//Prepare class table
	let rv = "";
	
	if (classJSON.rows.length == 0){
		//If professor has no classes
		rv = "You have no registered classes.";
	}else{
		//Prepare table header
		rv = "<tr><th>Class PIN</th><th>Class Name</th><th>Section</th><th>Location</th><th>Time</th><th>Days</th><th></th></tr>";
		
		//Form table rows
		for(let x=0; x<classJSON.rows.length; x++){
			let currentClass = classJSON.rows[x];
			rv += "<tr>";
			rv += "<td>" + currentClass.class_id.toString() + "</td>";
			rv += "<td>" + currentClass.name.toString() + "</td>";
			rv += "<td>" + currentClass.section.toString() + "</td>";
			rv += "<td>" + currentClass.loc.toString() + "</td>";
			rv += "<td>" + currentClass.timeframe.toString() + "</td>";
			let dayString = generateDayIndicator(currentClass.days);
			rv += "<td>" + dayString + "</td>";
			rv += "<td><a href=http://localhost:8080/editClass?profid=" + profID.toString() + "&id=" + classJSON.rows[x].class_id.toString() +">Edit Class</a></td>"
			
			rv += "</tr>";
		}
	}
	
	//Update DOM
	document.getElementById("classtable").innerHTML = rv;
}

function generateDayIndicator(dayString){
	//Forms a string of format X/Y/Z, where X,Y,Z are days given by 1s on the input string
	let days = ["/M", "/Tu", "/W", "/Th", "/F"];
	let rv = "";
	for (let x=0; x<days.length; x++){
		if (dayString[x] == 1){
			rv += days[x];
		}
	}
	
	rv = rv.substr(1);
	return rv;
}