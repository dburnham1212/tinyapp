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
function getUserByEmail(email, users) {
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

module.exports = { generateRandomString, getUserByEmail, urlsForUser };