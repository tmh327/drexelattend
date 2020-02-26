function checkForm() {
   // TODO: Perform input validation 
   var fullname;
   var email;
   var password;
   var passwordConfirm;
   var myArr=[];

    var x = document.getElementById('submit');
    x.addEventListener("click", function(){

   	document.getElementById('formErrors').style.display = "block";


   	// If no name is entered
	if(document.getElementById('fullName').value === ""){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[0].style.display = "block";
		myArr.push("Missing full name.");
		document.getElementById('fullName').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e1");
	}

	// If email address is not the correct format
	var mailformat = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	if(!(document.getElementById('email').value.match(mailformat))){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li')
		//emsg[1].style.display = "block";
		myArr.push("Invalid or missing email address.");
		document.getElementById('email').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e2");
		
	}

	// If password is not 9-20 length
	if(document.getElementById('password').value.length<9 || document.getElementById('password').value.length>21){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[2].style.display = "block";
		myArr.push("Password must be between 10 and 20 characters.");
		document.getElementById('password').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e3");
		if (document.getElementById('password').value.length<1){

			myArr.push("Password must contain at least one lowercase character.");
			myArr.push("Password must contain at least one uppercase character.");
		}
	}

	// If password has lower case
	if(document.getElementById('password').value!="" && document.getElementById('password').value.toUpperCase()===document.getElementById('password').value){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[3].style.display = "block";
		myArr.push("Password must contain at least one lowercase character.");
		document.getElementById('password').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e4");
	}

	// If password has upper case 
	if(document.getElementById('password').value!="" && document.getElementById('password').value.toLowerCase()===document.getElementById('password').value){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[4].style.display = "block";
		myArr.push("Password must contain at least one uppercase character.");
		document.getElementById('password').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e5");
	}

	var digitformat = /(?=.*\d)/;
	if(document.getElementById('password').value === "" || !(document.getElementById('password').value.match(digitformat))){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[5].style.display = "block";
		myArr.push("Password must contain at least one digit.");
		document.getElementById('password').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e6");
	}

	if(document.getElementById('password').value != document.getElementById('passwordConfirm').value){
		//var emsg = document.getElementById('formErrors').getElementsByTagName('li');
		//emsg[6].style.display = "block";
		myArr.push("Password and confirmation password don't match.");
		document.getElementById('password').style.border = "2px solid rgb(255, 0, 0)";
		document.getElementById('passwordConfirm').style.border = "2px solid rgb(255, 0, 0)";
		console.log("e7");
	}


	event.preventDefault();

	if (myArr.length===0){
		document.getElementById('formErrors').style.display = "none";
		console.log(myArr.length)
	} else {
		document.getElementById('formErrors').style.display = "block";
		document.getElementById("formErrors").appendChild(createList(myArr));
		console.log(myArr.length)
	}

	})

}

function createList(myArr){

	var listView=document.createElement('ul');

	for(var i=0;i<myArr.length;i++){
    var listViewItem=document.createElement('li');
    listViewItem.appendChild(document.createTextNode(myArr[i]));
    listView.appendChild(listViewItem);
	}
	return listView;
}