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
    if (key.userID === id) {
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
    return res.status(400).send("You must be logged in to use TinyApp!");
  }
  const urlShortCode = randomString();
  urlDatabase[urlShortCode].longURL = req.body.longURL;
  urlDatabase[urlShortCode].userID = user_id;

  res.redirect(`/urls/${urlShortCode}`); //redirecting from shortURL to longURL
});

// Read a short URL - GET
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (!longURL) {
      res.status(400).send("This short url does not exist!");
    } else {
      res.redirect(longURL);
    }
  }
});

//Update - POST
app.post('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId].longURL = longURL;
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
  if (!user_id) {
    return res.redirect('/login');
  }
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
    longURL: urlDatabase[req.params.id].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

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
    return res.status(400).send("You must login first!");
  }

  const urlObj = urlsForUser(user_id);

  const user = users[user_id];
  const templateVars = { user, urls: urlObj};
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

//login route - POST
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("You must enter both email and password to register!");
  }

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(400).send("You haven't registered this email!");
  }

  if (user.password !== password) {
    return res.status(400).send("Email or password is incorrect!");
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