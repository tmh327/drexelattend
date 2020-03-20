var classID = getQueryVariable("classid");
var profID = getQueryVariable("profid");
showattendance();

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

function showattendance(){
	//Form new xhttp request
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			//Upon reception of response, distribute received info
			parseStudents(JSON.parse(xhttp.responseText));
		}
	}
	
    //Prep URL
	let URL = "./attendance?id=" + profID.toString() + "&classid=" + classID.toString();
	xhttp.open("GET",URL,true);
	xhttp.send();
}

function parseStudents(classJSON){
	//Prepare student table
	let rv = "";
	
	if (classJSON.rows.length == 0){
		//If professor has no classes
		rv = "You have no attendance instances for this class.";
    }
    else{
		//Prepare table header
		rv = "<tr><th>Class Name</th><th>Section</th><th>Student Name</th></tr>";
		
		//Form table rows
		for(let x=0; x<classJSON.rows.length; x++){
			let currentClass = classJSON.rows[x];
			rv += "<tr>";
			rv += "<td>" + currentClass.student.toString() + "</td>";
			rv += "<td>" + currentClass.name.toString() + "</td>";
            rv += "<td>" + currentClass.section.toString() + "</td>";
			rv += "</tr>";
		}
	}
	
	//Update DOM
	document.getElementById("studentattendance").innerHTML = rv;
}   

document.getElementById("buttonReturn").addEventListener("click", function(){
	document.location.href='professorhub.html?profid=' + profID.toString();
});