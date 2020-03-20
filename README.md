# drexelattend
Drexel Attend
In order to run the server.
Create the mySQL database according to our Sql Database Creation file.
Change this part below to fit your mysql:

let con = mysql.createConnection({
	'host': 'localhost',
	'user': 'root',
	'password': '12345678',
	'database': 'drexel_attend'
});

type in command line: node s_drexelattend.js
