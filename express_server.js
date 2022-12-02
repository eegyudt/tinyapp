const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");

app.use(express.urlencoded({ extended: true })); //added for POST requests

app.use(cookieSession({
  name: 'user_id',
  keys: ['user_id'],
  // Cookies expire in 24 hours
  maxAge: 24 * 60 * 60 * 1000
}));


//HELPER FUNCTIONS
let { randomString, getUserByEmail, urlsForUser } = require('./helpers');


// DATABASES
// Database of URLs
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

//Database for users
const users = {
  GOEQHgt: {
    id: 'GOEQHgt',
    email: 'd@d.com',
    password: '$2a$10$2jEvZDsrfpQy6SGLuKFjzeGs.CGMIbWPmHCrAUzA2O7yhqSsB.ywC'
  }
};


// Rendering home page
app.get("/", (req, res) => {
  const user_id = req.session['user_id'];

  if (!user_id) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});

// CRUD URLS - API/data handler routes
// Create - POST
app.post("/urls", (req, res) => {
  const user_id = req.session['user_id'];

  if (!user_id) {
    return res.status(400).send(`<h1>You must be logged in to use TinyApp!<h1> <a href ="/login">Back to Login</a>`);
  }
  const urlShortCode = randomString();
  urlDatabase[urlShortCode] = { longURL: req.body.longURL, userID: user_id };
  //redirecting from shortURL to longURL
  res.redirect(`/urls/${urlShortCode}`);
});


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


//Update - POST
app.post('/urls/:id', (req, res) => {
  const user_id = req.session['user_id'];

  //checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  const shortURL = req.params.id;

  //checking if short code is in urlDatabase
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  //checking if logged in user id matches with urlDatabase user id at shortURL
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId].longURL = longURL;
  res.redirect('/urls');
});


// Delete - POST
app.post('/urls/:id/delete', (req, res) => {
  const user_id = req.session['user_id'];

  // checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  const shortURL = req.params.id;

  //checking if short code is in urlDatabase
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  //checking if logged in user id matches with urlDatabase user id at shortURL
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Back to main page.</a>`);
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


// RENDERING / INDEX ROUTES - all the routes that render a ui - user (HTML/CSS)
// New - GET
app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];

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
  const user_id = req.session['user_id'];

  //checking if user is logged in
  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user = users[user_id];
  const urlShortCode = req.params.id;

  //checking if short code is in urlDatabase
  if (!urlDatabase[urlShortCode]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Back to main page.</a>`);
  }
  //checking if userID matches the logged in user
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


// Register - GET
app.get("/register", (req, res) => {
  const user_id = req.session['user_id'];

  if (user_id) {
    return res.redirect('/urls');
  }

  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_register", templateVars);
});

// Login - GET
app.get("/login", (req, res) => {
  const user_id = req.session['user_id'];

  if (user_id) {
    return res.redirect('/urls');
  }

  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_login", templateVars);
});


//All - GET
app.get("/urls", (req, res) => {
  const user_id = req.session['user_id'];

  if (!user_id) {
    return res.status(400).send(`<h1>You must login first!<h1> <a href ="/login">Back to Login</a>`);
  }

  let urlObj = urlsForUser(user_id, urlDatabase);
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

  // Checking if both email and password has been entered
  if (!email || !password) {
    return res.status(400).send(`<h1>You must enter both email and password to register!<h1> <a href ="/register">Back to Registration</a>`);
  }
  // Checking if email address has already been registered
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`<h1>You've already registered this email!<h1> <a href ="/register">Back to Registration</a>`);
  }

  const user_id = randomString();
  req.session.user_id = user_id;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id: user_id,
    email: email,
    password: hashedPassword
  };
  users[user_id] = user;
  res.redirect('/urls');
});


//login route - POST
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Checking if both email and password has been entered
  if (!email || !password) {
    return res.status(400).send(`<h1>You must enter both email and password to login!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user = getUserByEmail(email, users);

  // Checking if email is registered
  if (!user) {
    return res.status(400).send(`<h1>You haven't registered this email!<h1> <a href ="/register">Back to Registration</a>`);
  }

  // Checking if password matches user's password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send(`<h1>Email or password is incorrect!<h1> <a href ="/login">Back to Login</a>`);
  }

  const user_id = user.id;
  req.session.user_id = user_id;
  res.redirect('/urls');
});


//logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});