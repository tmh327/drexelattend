// Connection to Database
//let myKey = require("../sqlinfo.json");

//Import database and login info
let mysql = require('mysql');
let con = mysql.createConnection({
  'host': 'localhost',
  //'user': myKey.user,
  'user': 'root',
  //'password': myKey.passwd,
  'password': '1234',
  'database': 'drexel_attend'
});

//Connect to database
con.connect(function(err) {
  if (err) {
    console.log(err);
  }else{
    console.log("Database successfully connected.");
  } 
});

//Import express and session modules
const express = require('express')
const session = require('express-session')

const app = express();
app.use(express.urlencoded({extended: true})); // needed this line in order to use built-in body-parser

//Serve static files 
app.use(express.static("."));
app.use(express.static("./frontend"));

//Start session
app.use(
  session({
    // Name for the session ID cookie. Defaults to 'connect.sid'.
    name: 'sid', // constant name for session ID cookie
    saveUninitialized: false, // do not force session if the session is unintialized 
    resave: false, // do not allow session to save back to session store if no change
    secret: `WhatTheHell`, // huh?
    
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // specifies when the cookie will expire
      sameSite: true, // browser will only access cookie if in same domain
     secure: process.env.NODE_ENV === 'production'
    } //end of cookie
  })
)

// Array of users for now. will need to use MySQL
const users = [
  {id: 1, username:'alex', password:'secret'},
  {id: 2, username:'beth', password:'secret'}
]


const redirectLogin = (req,res,next) =>{
  if(!req.session.userId) {
    res.redirect('/login')
  } else {
    next()
  }
}

const redirectHome = (req,res,next) =>{
  if(!req.session.userId) {
    res.redirect('/home')
  } else {
    next()
  }
}

app.use((req,res,next)=>{
  const { userId } =req.session
  if (userId){
    res.locals.user = users.find(
      user=>user.id ===userId
    )
  } 
  next()
})

app.get('/', (req, res) => {
  
  console.log(req.session)
  console.log(req.session.cookie)
  console.log(req.session.cookie.expires) 
  console.log(req.session.cookie.maxAge) 
  console.log(req.session.id) 
  console.log(req.sessionID)

  const {userId} = req.session;
  console.log(userId);

  // Test block for MySQL. If successful, command prompt will see the professors table
  con.query('SELECT * FROM professors', function(err, rows, fields) {
  if (err) {
    console.log(err);
    res.send(err);
  }
    console.log(rows)
  });

  res.send(`<link href="style.css" rel="stylesheet">
    <body>

    <h1>Welcome</h1>
    <div> User Id: ${userId} </div>
    <br/>
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    <a href='/home'>Home</a>
    <form method='post' action='/logout'>
      <button>Logout</button>
    </form>

    </body>
    `)
})


app.get('/home', redirectLogin, (req, res) => {
  const user = users.find(user => user.id === req.session.userId)
  res.send(`<link href="style.css" rel="stylesheet">
    <body>

    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Username: ${user.username}</li>
    </ul>

    </body>
    `)
})

app.get('/login', (req, res) => {

  res.send(`<link href="style.css" rel="stylesheet">
    <body>

    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='text' name='username' placeholder='Username' required />
      <br>
      <input type='password' name='password' placeholder='Password' required />
      <br>
      <input type=submit>
    </form>
    <a href='/register'>Register</a>

    </body>
    `)
})

app.get('/register', (req, res) => {
  res.send(`<link href="style.css" rel="stylesheet">
    <body>

    <h1>Register</h1>
    <form method='post' action='/register'>
      <input type='username' name='username' placeholder='Username' required />
      <br>
      <input type='password' name='password' placeholder='Password' required />
      <br>
      <input type=submit>
    </form>
    <a href='/login'>Login</a>

    </body>
    `)
})


app.post('/login', (req, res) => {

  con.query('SELECT * FROM professors WHERE username=\''+ req.body.username +'\'', function(err, rows, fields) {
  if (err) {
    console.log(err);
    res.send(err);
  }
    //res.send(JSON.stringify({ "rows": rows }));
    console.log(rows)
    console.log(req.body.username)
  });

  const { username, password } = req.body
  if(username && password) {
    const user = users.find(
      user => user.username === username && user.password === password)
    if (user){
      req.session.userId = user.id
      return res.redirect('/home')
    }
  } // validation draft
  res.redirect('/login')
})

app.post('/register', (req, res) => {
  const { username, password } = req.body
  if(name && username && password) {
    const exists = users.some(user => user.username === username)
    
    if (!exists){
      const user = {
        id: users.length + 1,
        username,
        password
      }
      users.push(user)
      req.session.userId = user.id
      return res.redirect('/home')
    }
  } // validation draft
  res.redirect('/register')
})

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err){
      return res.redirect('/home')
    }
    res.clearCookie()
    res.redirect('/login')
  })
})

app.listen(8080)
console.log('http://localhost:8080')