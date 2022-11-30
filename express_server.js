const express = require("express");
const app = express();
const PORT = 8080;
let cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true })); //added for POST requests





// generate a random 6 character alphanumeric string
let randomString = function() {
  const inputArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let randomStr = '';
  for (let i = 0; i <= 6; i++) {
    let randomNum = Math.floor(Math.random() * inputArr.length);
    randomStr = randomStr + inputArr[randomNum];
  }
  return randomStr;
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
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// Details - GET
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//All - GET
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//AUTH API ROUTES
// Register



//Login route
app.post('/login', (req, res) => {

  const username = req.body.username;
  res.cookie('username', username);

  res.redirect('/urls');
});

//logout route







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});