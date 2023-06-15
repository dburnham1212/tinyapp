const cookieParser = require('cookie-parser'); //require the cookie parser
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set ejs as the view engine
app.set("view engine", "ejs");
//use the cookie parser
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));


//DATABASE VALUES
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
    visited: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
    visited: 0
  },
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


// HELPER FUNCTIONS
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

// Cycle through users and check if an email is equal to the params, if so return it
function getUserByEmail(email) {
  for(const userID in users){
    if(users[userID].email === email){
      return users[userID];
    } 
  }
  return undefined;
}

// Cycle through users and put urls that correspond with a specific user id into an object
function urlsForUser(urlDatabase, userID){
  let userDatabase = {};
  for(let urlID in urlDatabase) {
    if(urlDatabase[urlID].userID === userID){
      userDatabase[urlID] = urlDatabase[urlID];
    }
  }
  return userDatabase;
}
// POST METHODS
// Create a new short URL and redirect to that page after creation
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) { // If the user is not logged in redirect to login page
    res.status(403).send("403 error: NO USER LOGGED IN");
  } else {
    // Generate a random string 6 characters long, if the string exists generate another!
    let newIdLength = 6;
    let newID = generateRandomString(newIdLength); 
    while(urlDatabase[newID]){
      newID = generateRandomString(newIdLength);
    }
    //Update database to include new key pair and redirect to a page showing this new key value pair.
    urlDatabase[newID] = { userID: userID, longURL: req.body.longURL, visited: 0 }
    res.redirect(`/urls/${newID}`);
  }
});

// Use post method to delete the item from the database, and redirect to the homepage
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in redirect to login page
    res.status(403).send("403 error: NO USER LOGGED IN\n");
  } else if (!urlDatabase[urlID]) {
    res.status(403).send(`403 error: URL AT ${urlID} DOES NOT EXIST\n`);
  } else if (urlDatabase[urlID].userID !== userID) {
    res.status(403).send(`403 error: YOU DO NOT HAVE ACCES TO ${urlID}\n`);
  } else {
    delete urlDatabase[urlID] ;
    res.redirect("/urls");
  }
});

// Use post method update an item from the database, and redirect to the appropriate page
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in redirect to login page
    res.status(403).send("403 error: NO USER LOGGED IN\n");
  } else if (!urlDatabase[urlID]) {
    res.status(403).send(`403 error: URL AT ${urlID} DOES NOT EXIST\n`);
  } else if (urlDatabase[urlID].userID !== userID) {
    res.status(403).send(`403 error: YOU DO NOT HAVE ACCES TO ${urlID}\n`);
  } else {
    urlDatabase[urlID].longURL = req.body.longURL;
    res.redirect(`/urls/${urlID}`);
  }
});

// Use post method to allow user to logout and will clear cookies from data
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  if (req.cookies["user_id"]) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    // Generate a random string 6 characters long, if the string exists generate another!
    let newIdLength = 6;
    let newID = generateRandomString(newIdLength);
    while(users[newID]) {
      newID = generateRandomString(newIdLength);
    }
    if(!req.body.email){ //Check if the field was empty
      res.status(400).send("400 error: NO EMAIL INPUT");
    } else {//Check if the email already exists
      if (getUserByEmail(req.body.email)) {
        res.status(400).send("400 error: EMAIL ALREADY FOUND IN DATABASE");
      }
    } 
    if(!req.body.password){//Check if the password field was empty
      res.status(400).send("400 error: NO PASSWORD INPUT");
    }
    //Setup the new user object
    users[newID] = { id: newID, email: req.body.email, password: req.body.password };
    //Create the cookie based on the user object and redirect to appropriate page
    res.cookie('user_id', newID);
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  if (req.cookies["user_id"]) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    if(!req.body.email){ //Check if the field was empty
      res.status(403).send("403 error: NO EMAIL INPUT");
    } else {//Check if the email doesnt exists
      if (!getUserByEmail(req.body.email)) {
        res.status(403).send("403 error: EMAIL NOT FOUND");
      }
    } 
    if(!req.body.password){//Check if the password field was empty
      res.status(403).send("403 error: NO PASSWORD INPUT");
    }
    //Get the user account based off of the email
    const user = getUserByEmail(req.body.email);
    if(user.password !== req.body.password) {//Check if the password matches what we have in our records
      res.status(403).send("403 error: INVALID CREDENTIALS");
    }
    //Create the cookie based on the user object and redirect to appropriate page
    res.cookie('user_id', user.id);
    res.redirect(`/urls`);
  } 
});


// GET METHODS
// Travel to longURL based off of key value pair
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  // If we try to navigate to a page with an invalid id, send and error
  if(!urlDatabase[req.params.id] ){
    res.status(404).send("404 error: ID NOT IN DATABASE");
  } else { //otherwise navigate to correct page and update visited count
    const longURL = `${urlDatabase[urlID].longURL}`
    urlDatabase[urlID].visited++;
    res.redirect(longURL);
  }
});

// Home page for tinyurl APP
app.get("/", (req, res) => {
  if (!req.cookies["user_id"]) { // If the user is not logged in redirect to login
    res.redirect("/login");
  } else {
    const userID = req.cookies["user_id"];
    let userDatabase = urlsForUser(urlDatabase, userID);
    const templateVars = { urls: userDatabase, user: users[userID] };
    res.render("urls_index", templateVars);
  }
});

// Second url for tinyurl APP homepage
app.get("/urls", (req, res) => { // If the user is not logged in redirect to login
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const userID = req.cookies["user_id"];
    let userDatabase = urlsForUser(urlDatabase, userID);
    const templateVars = { urls: userDatabase, user: users[userID] };
    res.render("urls_index", templateVars);
  }
});

// Navigation for a page containing a form to create a new tinyurl
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) { // If the user is not logged in redirect to login
    res.redirect("/login");
  } else {
    const userId = req.cookies["user_id"];
    const templateVars = { user: users[userId] };
    res.render("urls_new", templateVars);
  }
});

// Navigation to a page to show a url based off of its key value pair in urlDatabase
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in redirect to login
    res.status(403).send("403 error: PERMISSION DENIED, YOU ARE NOT LOGGED IN");
  } else if (urlDatabase[req.params.id].userID !== userID ){ // If the user is logged in but their userID does not correspond with URLS userID
    res.status(403).send("403 error: PERMISSION DENIED, YOU DO NOT HAVE ACCESS TO THIS PAGE");
  } else {
    const templateVars = { id: urlID, url: urlDatabase[urlID], user: users[userID] };
    res.render("urls_show", templateVars);
  }
});

// Navigation to a page where users can register an account
app.get("/register", (req, res) =>{
  const userID = req.cookies["user_id"];
  if (userID) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    
    const templateVars = { user: users[userID] };
    res.render("urls_registration", templateVars);
  }
});

// Navigation to a page where users can login to an account
app.get("/login", (req, res) =>{
  const userID = req.cookies["user_id"];
  if(userID){ // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[userID] };
    res.render("urls_login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

