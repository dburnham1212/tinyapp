const cookieParser = require('cookie-parser'); //require the cookie parser
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");
//use the cookie parser
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// function to genereate a random string based off of the length parameter
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'//usable characters
  let count = 0;
  let randomString = '';
  // loop throught the available characters and append each to randomString
  while(count < length){
    let charPosition = Math.round(Math.random() * (chars.length - 1));
    randomString = `${randomString}${chars.charAt(charPosition)}`
    count ++;
  }
  return randomString;
}

function getUserByEmail(email) {
  for(const user_id in users){//Check if the email already exists
    if(users[user_id].email === email){
      return users[user_id];
    } 
  }
  return undefined;
}

// Create a new short URL and redirect to that page after creation
app.post("/urls", (req, res) => {
  // Generate a random string 6 characters long, if the string exists generate another!
  let newIdLength = 6;
  let newID = generateRandomString(newIdLength); 
  while(urlDatabase[newID]){
    newID = generateRandomString(newIdLength);
  }
  //Update database to include new key pair and redirect to a page showing this new key value pair.
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

// Use post method to delete the item from the database, and redirect to the homepage
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id] ;
  res.redirect("/urls");
});

// Use post method update an item from the database, and redirect to the appropriate page
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// Use post method to allow user to login with a specific username
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

// Use post method to allow user to logout and will clear cookies from data
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let newIdLength = 6;
  let newId = generateRandomString(newIdLength);
  while(users[newId]) {
    newId = generateRandomString(newIdLength);
  }
  if(!req.body.email){ //Check if the field was empty
    res.status(400).send("400 error: NO EMAIL INPUT");
  } else {//Check if the email already exists
    if (!getUserByEmail()) {
      res.status(400).send("400 error: EMAIL ALREADY FOUND IN DATABASE");
    }
  } 
  if(!req.body.password){//Check if the password field was empty
    res.status(400).send("400 error: NO PASSWORD INPUT");
  }
  //Setup the new user object
  users[newId] = {};
  users[newId].id = newId;
  users[newId].email = req.body.email;
  users[newId].password = req.body.password;
  //Create the cookie based on the user object and redirect to appropriate page
  res.cookie('user_id', newId);
  console.log(users[newId]);
  res.redirect(`/urls`);
});

// Travel to longURL based off of key value pair
app.get("/u/:id", (req, res) => {
  // If we try to navigate to a page with an invalid id, send and error
  if(!urlDatabase[req.params.id] ){
    res.status(404).send("404 error: PAGE NOT FOUND");
  } else { //otherwise navigate to correct page
    const longURL = `${urlDatabase[req.params.id]}`
    res.redirect(longURL);
  }
});

// Home page for tinyurl APP
app.get("/", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_index", templateVars);
});

// Second url for tinyurl APP homepage
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_index", templateVars);
});

// Navigation for a page containing a form to create a new tinyurl
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

// Navigation to a page to show a url based off of its key value pair in urlDatabase
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[userId] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) =>{
  const userId = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_registration", templateVars);
});

// navigate to a page to show the json version of the url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

