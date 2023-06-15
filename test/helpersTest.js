const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('# Testing getUserByEmail', function() {
  it('should return a user with valid email for user@example.com', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return a user with valid email for user2@example.com', () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserID = "user2RandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined for user3@example.com', () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});