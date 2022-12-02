const express = require("express");
const app = express();
const PORT = 8080;
let cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //added for POST requests


// //database for random code - url key-value pairs
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  ixVoGr: {
    longURL: "https://www.apple.ca",
    userID: "aJ50lW",
  },
  ebDoGx: {
    longURL: "https://www.costco.ca",
    userID: "123456",
  },
};



//database for users
const users = {
  123456: {
    id: "123456",
    email: "a@a.com",
    password: "123",
  },
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
      return users[key];
    }
  }
  return foundUser;
};

//
const urlsForUser = function(id) {
  const urlObject = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      const valueObj = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID
      };
      urlObject[key] = valueObj;
    }
  }
  return urlObject;
};

// Rendering home page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// CRUD URLS
// API/data handler routes
// Create - POST
app.post("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    return res.status(400).send(`<h1>You must be logged in to use TinyApp!<h1> <a href ="/login">Back to Login</a>`);
  }
  const urlShortCode = randomString();
  urlDatabase[urlShortCode] = { longURL: req.body.longURL, userID: user_id };
  // urlDatabase[urlShortCode].longURL = req.body.longURL; //?????
  // urlDatabase[urlShortCode].userID = user_id;

  res.redirect(`/urls/${urlShortCode}`); //redirecting from shortURL to longURL
});

// @!!!
// Read a short URL - GET
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (!longURL) {
      res.status(400).send(`<h1>This short url does not exist!<h1> <a href ="/u/:id">Back to short URL</a>`);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(400).send(`<h1>This short url does not exist!<h1> <a href ="/urls">Back to main page</a>`);
  }
});

//POST f a user tries to access a shortened url (GET /u/:id) that does not exist, we should send them a relevant message - !!!
//curl -X POST -i localhost:8080/u/sssddd


//Update - POST
app.post('/urls/:id', (req, res) => {
  const user_id = req.cookies['user_id'];
  //checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }
  const user = users[user_id];
  const id = req.params.id;

  //checking if short code is in urlDatabase and if userID matches for logged in user
  if (!urlDatabase[id]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  //checking if logged in user id matches with urlDatabase user id for short code
  if (urlDatabase[id].userID != user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }


  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId].longURL = longURL;
  res.redirect('/urls');
});


//POST /urls/:id should return a relevant error message if id does not exist
//curl -X POST -i localhost:8080/urls/b6UTxR

//POST /urls/:id should return a relevant error message if the user is not logged in
//curl -X POST -i localhost:8080/urls/b6UTxQ

//POST /urls/:id should return a relevant error message if the user does not own the URL
//curl -X POST -i localhost:8080/urls/b6UTxQ

//user's short code - !!displaying you must login first
// curl -X POST -i localhost:8080/urls/ebDoGx

// Delete - POST
app.post('/urls/:id/delete', (req, res) => {
  const user_id = req.cookies['user_id'];

  // checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user = users[user_id];
  const shortUrl = req.params.id;

  //checking if short code is in urlDatabase
  if (!urlDatabase[shortUrl]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  //checking if logged in user id matches with urlDatabase user id for short code
  if (urlDatabase[shortUrl].userID != user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

//POST /urls/:id/delete should return a relevant error message if id does not exist 
//curl -X POST -i localhost:8080/urls/b6UTxR/delete

//POST /urls/:id/delete should return a relevant error message if the user is not logged in 
//curl -X POST -i localhost:8080/urls/b6UTxQ/delete

//POST /urls/:id/delete should return a relevant error message if the user does not own the URL
//curl -X POST -i localhost:8080/urls/b6UTxQ/delete



// RENDERING / INDEX ROUTES
// all the routes that render a ui - user (HTML/CSS)
// New - GET
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    res.send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
    return res.redirect('/login');
  }
  const user = users[user_id];
  const templateVars = { user };

  res.render("urls_new", templateVars);
});

// Details - GET /urls/:id
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies['user_id'];

  //checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user = users[user_id];
  const urlShortCode = req.params.id;
  
  //checking if short code is in urlDatabase and if userID matches for logged in user
  
  if (!urlDatabase[urlShortCode]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }
  if (urlDatabase[urlShortCode].userID !== user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }
  
  const longURL = urlDatabase[urlShortCode].longURL;

  const templateVars = {
    id: urlShortCode,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

// delete after debugging
// app.post("/urls", (req, res) => {
//   const user_id = req.cookies['user_id'];

//   if (!user_id) {
//     return res.status(400).send("You must be logged in to use TinyApp!");
//   }
//   const urlShortCode = randomString();
//   urlDatabase[urlShortCode] = {longURL: req.body.longURL, userID: user_id};
//   // urlDatabase[urlShortCode].longURL = req.body.longURL; //?????
//   // urlDatabase[urlShortCode].userID = user_id;

//   res.redirect(`/urls/${urlShortCode}`); //redirecting from shortURL to longURL
// });



// Register - GET
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (user_id) {
    return res.redirect('/urls');
  }
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_register", templateVars);
});

// Login - GET
app.get("/login", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (user_id) {
    return res.redirect('/urls');
  }
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_login", templateVars);
});


//All - GET
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  let urlObj = urlsForUser(user_id);

  const user = users[user_id];
  const templateVars = { user, urls: urlObj };
  res.render("urls_index", templateVars);
});

//AUTH API ROUTES
// Register

//register route - POST
app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`<h1>You must enter both email and password to register!<h1> <a href ="/register">Back to Registration</a>`);
  }

  if (getUserByEmail(email)) {
    return res.status(400).send(`<h1>You've already registered this email!<h1> <a href ="/register">Back to Registration</a>`);
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

//login route - POST
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(`<h1>You must enter both email and password to login!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(400).send(`<h1>You haven't registered this email!<h1> <a href ="/register">Back to Registration</a>`);
  }

  if (user.password !== password) {
    return res.status(400).send(`<h1>Email or password is incorrect!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user_id = user.id;

  res.cookie('user_id', user_id);

  res.redirect('/urls');
});

//logout route
app.post('/logout', (req, res) => {

  const user_id = req.body.user_id;
  res.clearCookie('user_id', user_id);

  res.redirect('/login');
});

// listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});