//REQUIRES
const express = require("express");
const cookieSession = require('cookie-session'); 
const bcrypt = require("bcryptjs");

const {generateRandomString, getUserByEmail, urlsForUser} = require("./helpers");


// CONSTANTS
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");


// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Key1', 'Key2', 'Key3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// DATABASE OBJECTS
// URL Database
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

// Users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10) // Encrypt password for test case (not great practice but for the sake of testing)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)// Encrypt password for test case (not great practice but for the sake of testing)
  },
};


// POST METHODS
// Create a new short URL and redirect to that page after creation
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) { // If the user is not logged in redirect to login page
    res.status(403).send('403 ERROR: NO USER LOGGED IN\n');
  } else {
    // Generate a random string 6 characters long, if the string exists generate another!
    let newIdLength = 6;
    let newID = generateRandomString(newIdLength);
    while (urlDatabase[newID]) {
      newID = generateRandomString(newIdLength);
    }
    //Update database to include new key pair and redirect to a page showing this new key value pair.
    urlDatabase[newID] = { userID: userID, longURL: req.body.longURL, visited: 0 };
    res.redirect(`/urls/${newID}`);
  }
});

// Use post method to delete the item from the database, and redirect to the homepage
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in send an error to let them know
    res.status(403).send('403 ERROR: PERMISSION DENIED, NO USER LOGGED IN\n');
  } else if (!urlDatabase[urlID]) { // If the user is logged in but the url does not exist let them know
    res.status(404).send(`404 ERROR: URL AT ${urlID} DOES NOT EXIST\n`);
  } else if (urlDatabase[urlID].userID !== userID) { // If the user is logged in but the url does not belong to them let them know
    res.status(403).send(`403 ERROR: PERMISSION DENIED, YOU DO NOT HAVE ACCES TO ${urlID}\n`);
  } else { // Otherwise delete the url and navigate back to the view all urls
    delete urlDatabase[urlID];
    res.redirect("/urls");
  }
});

// Use post method update an item from the database, and redirect to the appropriate page
app.post("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in send an error to let them know
    res.status(403).send('403 ERROR: PERMISSION DENIED, NO USER LOGGED IN\n');
  } else if (!urlDatabase[urlID]) { // If the user is logged in but the url does not exist let them know
    res.status(404).send(`404 ERROR: URL AT ${urlID} DOES NOT EXIST\n`);
  } else if (urlDatabase[urlID].userID !== userID) { // If the user is logged in but the url does not belong to them let them know
    res.status(403).send(`403 ERROR: PERMISSION DENIED, YOU DO NOT HAVE ACCES TO ${urlID}\n`);
  } else { // Otherwise redirect to the specified url
    urlDatabase[urlID].longURL = req.body.longURL;
    res.redirect(`/urls/${urlID}`);
  }
});

app.post("/register", (req, res) => {
  if (req.session.userID) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    // Generate a random string 6 characters long, if the string exists generate another!
    let newIdLength = 6;
    let newID = generateRandomString(newIdLength);
    while (users[newID]) {
      newID = generateRandomString(newIdLength);
    }
    if (!req.body.email) { //Check if the field was empty
      res.status(400).send('400 ERROR: NO EMAIL INPUT\n');
    } else if (getUserByEmail(req.body.email, users)) {//Check if the email already exists
      res.status(400).send('400 ERROR: EMAIL ALREADY FOUND IN DATABASE\n');
    } else if (!req.body.password) {//Check if the password field was empty
      res.status(400).send('400 ERROR: NO PASSWORD INPUT\n');
    } else {
      //Create new hashed password
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      //Setup the new user object
      users[newID] = { id: newID, email: req.body.email, password: hashedPassword };
      //Create the cookie based on the user object and redirect to appropriate page
      req.session.userID = newID;
      res.redirect(`/urls`);
    }
  }
});

app.post("/login", (req, res) => {
  //Get the user account based off of the email
  const user = getUserByEmail(req.body.email, users);
  if (req.session.userID) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else {
    if (!req.body.email) { //Check if the field was empty
      res.status(403).send('403 ERROR: PERMISSION DENIED, NO EMAIL INPUT\n');
    } else if (!getUserByEmail(req.body.email, users)) {//Check if the email doesnt exists
      res.status(403).send('403 ERROR: PERMISSION DENIED, EMAIL NOT FOUND\n');
    } else if (!req.body.password) {//Check if the password field was empty
      res.status(403).send('403 ERROR: PERMISSION DENIED, NO PASSWORD INPUT\n');
    } else if (!bcrypt.compareSync(req.body.password, user.password)) {//Check if the password matches with the hash that we have stored for the user
      res.status(403).send('403 ERROR: PERMISSION DENIED, INVALID CREDENTIALS\n');
    } else { //Create the cookie based on the user object and redirect to appropriate page
      req.session.userID = user.id;
      res.redirect(`/urls`);
    }
  }
});

// Use post method to allow user to logout and will clear cookies from data
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});


// GET METHODS
// Travel to longURL based off of key value pair
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (!urlDatabase[req.params.id]) { // If we try to navigate to a page with an invalid id, send and error
    res.status(404).send('404 ERROR: ID NOT IN DATABASE\n');
  } else { // otherwise navigate to correct page and update visited count
    const longURL = `${urlDatabase[urlID].longURL}`;
    urlDatabase[urlID].visited++;
    res.redirect(longURL);
  }
});

// Home page for tinyurl APP
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) { // If the user is not logged in redirect to login
    res.redirect("/login");
  } else { // Otherwise redirect to urls
    res.redirect("/urls")
  }
});

// Second url for tinyurl APP homepage
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) { // If the user is not logged in redirect to login
    res.redirect("/login");
  } else { // Otherwise create database for specific user and navigate to a page that shows a list of URLS
    let userDatabase = urlsForUser(urlDatabase, userID);
    const templateVars = { urls: userDatabase, user: users[userID] };
    res.render("urls_index", templateVars);
  }
});

// Navigation for a page containing a form to create a new tinyurl
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) { // If the user is not logged in redirect to login
    res.redirect("/login");
  } else { // Otherwise go to page where user can create a new URL
    const templateVars = { user: users[userID] };
    res.render("urls_new", templateVars);
  }
});

// Navigation to a page to show a url based off of its key value pair in urlDatabase
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const urlID = req.params.id;
  if (!userID) { // If the user is not logged in send appropriate error message
    res.status(403).send('403 ERROR: PERMISSION DENIED, YOU ARE NOT LOGGED IN\n');
  } else if (urlDatabase[req.params.id].userID !== userID) { // If the user is logged in but their userID does not correspond with URLS userID
    res.status(403).send('403 ERROR: PERMISSION DENIED, YOU DO NOT HAVE ACCESS TO THIS PAGE\n');
  } else { // Otherwise go to urls_show page and show the current url
    const templateVars = { id: urlID, url: urlDatabase[urlID], user: users[userID] };
    res.render("urls_show", templateVars);
  }
});

// Navigation to a page where users can register an account
app.get("/register", (req, res) =>{
  const userID = req.session.userID;
  if (userID) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else { // Otherwise go to registration page
    const templateVars = { user: users[userID] };
    res.render("urls_registration", templateVars);
  }
});

// Navigation to a page where users can login to an account
app.get("/login", (req, res) =>{
  const userID = req.session.userID;
  if (userID) { // If the user is logged in redirect to urls page
    res.redirect("/urls");
  } else { // Otherwise go to login page
    const templateVars = { user: users[userID] };
    res.render("urls_login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

