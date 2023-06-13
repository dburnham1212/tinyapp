const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

// Set ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

// Create a new short URL and redirect to that page after creation
app.post("/urls", (req, res) => {
  // Generate a random string 6 characters long, if the string exists generate another!
  let newID = generateRandomString(6); 
  while(urlDatabase[newID]){
    newID = generateRandomString(6);
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

// Use post method to delete the item from the database, and redirect to the homepage
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// Travel to longURL based off of key value pair
app.get("/u/:id", (req, res) => {
  const longURL = `${urlDatabase[req.params.id]}`
  res.redirect(longURL);
});

// Home page for tinyurl APP
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Second url for tinyurl APP homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Navigation for a page containing a form to create a new tinyurl
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Navigation to a page to show a url based off of its key value pair in urlDatabase
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

