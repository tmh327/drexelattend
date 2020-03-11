const express = require('express')
const session = require('express-session')

const app = express();
app.use(express.urlencoded({extended: true}));

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

// Array of users 
const users = [
  {id: 1, name: 'Alex', email:'alex@gmail.com', password:'secret'},
  {id: 2, name: 'Beth', email:'beth@gmail.com', password:'secret'}
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

  res.send(`<h1>Welcome</h1>
    ${userId}
    <br/>
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    <a href='/home'>Home</a>
    <form method='post' action='/logout'>
      <button>Logout</button>
    </form>
    `)
})


app.get('/home', redirectLogin, (req, res) => {
  const user = users.find(user => user.id === req.session.userId)
  res.send(`<h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Name: ${user.name}</li>
      <li>Email: ${user.email}</li>
    </ul>
    `)
})


app.get('/login', (req, res) => {
  res.send(`<h1>Login</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type=submit>
    </form>
    <a href='/register'>Register</a>
    `)
})

app.get('/register', (req, res) => {
  res.send(`<h1>Register</h1>
    <form method='post' action='/register'>
      <input name='name' placeholder='Name' required />
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type=submit>
    </form>
    <a href='/login'>Login</a>
    `)
})


app.post('/login', (req, res) => {
  const { email, password } = req.body
  if(email && password) {
    const user = users.find(
      user => user.email === email && user.password === password)
    if (user){
      req.session.userId = user.id
      return res.redirect('/home')
    }
  } // validation draft
  res.redirect('/login')
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body
  if(name && email && password) {
    const exists = users.some(user => user.email === email)
    
    if (!exists){
      const user = {
        id: users.length + 1,
        name,
        email,
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