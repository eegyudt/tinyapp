const express = require("express");
const app = express();
const PORT = 8080;
let cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //added for POST requests


//database for random code - url key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//database for users
const users = {
  //this is the format of properties in users object
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur",
  // },
};

//HELPER FUNCTIONS

//Helper function - generate a random 6 character alphanumeric string
let randomString = function() {
  const inputArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let randomStr = '';
  for (let i = 0; i <= 6; i++) {
    let randomNum = Math.floor(Math.random() * inputArr.length);
    randomStr = randomStr + inputArr[randomNum];
  }
  return randomStr;
};

//Helper function - find user in db with email address
const getUserByEmail = function(userEmail) {
  let foundUser = null;
  for (let key in users) {
    if (userEmail === users[key].email) {
      foundUser = key;
    }
  }
  return foundUser;
};


// Rendering home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// CRUD URLS
// API/data handler routes
// Create - POST
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const urlShortCode = randomString();
  urlDatabase[urlShortCode] = req.body.longURL;

  res.redirect(`/urls/${urlShortCode}`); //redirecting from shortURL to longURL
});

// Read all - GET
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Read one - GET
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Update - POST
app.post('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  res.redirect('/urls');
});

// Delete - POST
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

// RENDERING / INDEX ROUTES
// all the routes that render a ui - user (HTML/CSS)
// New - GET
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user };

  res.render("urls_new", templateVars);
});

// Details - GET
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});

// Register - GET
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_register", templateVars);
});

//All - GET
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//AUTH API ROUTES
// Register

//register route - POST
app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("You must enter both email and password to register!");
  }

  console.log('email: ', email, getUserByEmail(email));
  console.log(users);
  
  if (getUserByEmail(email)) {
    return res.status(400).send("You've already registered this email!");
  }

  const user_id = randomString();

  const user = {
    id: user_id,
    email: email,
    password: password
  };

  users[user_id] = user;

  res.cookie('user_id', user_id);
  
  res.redirect('/urls');
});


//Login route
app.post('/login', (req, res) => {

  const user_id = req.body.user_id;
  res.cookie('user_id', user_id);

  res.redirect('/urls');
});

//logout route
app.post('/logout', (req, res) => {

  const user_id = req.body.user_id;
  res.clearCookie('user_id', user_id);

  res.redirect('/urls');
});

// listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});