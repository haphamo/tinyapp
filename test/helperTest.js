const { assert } = require('chai');

const { checkEmail } = require('../helper.js');

const testUserDatabase = {
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

describe('checkEmail', function() {
  it('should return the userID if email exists', function() {
    const user = checkEmail("user@example.com", testUserDatabase)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user , expectedOutput, "Email exists!")
  });
  it('should return undefined if email does not exist', function() {
    const user = checkEmail("haphamo@hotmail.com", testUserDatabase)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput, "Email does not exist!")
  });


});