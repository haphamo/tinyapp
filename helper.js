function generateRandomString() {
  let shortURL = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
      shortURL += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    return shortURL;
};

let checkEmail = function (email, userDatabase) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userId;
    };
  };
  return undefined;
};

let urlsForUser = function(database, userID) {//function to filter urls for user specific
  let userSpecific = {};
  for (let shortURL in database) {
    let value = database[shortURL];
    if (value.userID === userID) {
      userSpecific[shortURL] = value;
    };
  };
  return userSpecific;
}

module.exports = {
  generateRandomString,
  checkEmail,
  //getId,
  urlsForUser
}