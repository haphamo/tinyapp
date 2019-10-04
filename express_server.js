const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


let cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["mituot"],

}))

function generateRandomString() {
  let shortURL = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
      shortURL += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    return shortURL;
};

checkEmail = function (email) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userId;
    };
  };
  return false;
};

checkPassword = function (password) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].password === password) {
      return userDatabase[userId].password;
    }
  }
  return false;
};

getId = function (email) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId].id
    };
  };
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" , shortURL: "b6UTxQ"},
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", shortURL: "i3BoGr" }
};

const userDatabase = {
  aJ48lW: {id: 'aJ48lW', email: 'ha.phamo@hotmail.com', password: '1234'}
};

app.get("/", (req, res) => {
  res.send("<h1>Hello! Welcome to the HomePage</h1>");
});

app.get("/urls", (req, res) => {//go back to fix this !!!!
  user = userDatabase[req.session.user_id]
  if (!user) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
    return;
  };
  let userSpecific = urlsForUser(urlDatabase, user.id)
  let templateVars = {urls: userSpecific,  user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {//get route ro create new links
  if (!req.session.user_id) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
  } else {
    user = userDatabase[req.session.user_id];
    let templateVars = { user_ID: req.body.id , user };
    res.render("urls_new", templateVars);
  };
});

app.post("/urls", (req, res) => {
  let redirected = generateRandomString()
  urlDatabase[redirected] = { "longURL" : req.body.longURL , userID: req.session.user_id, "shortURL": redirected}
  console.log('shortURL has been created for ' + req.body.longURL +'\n' + redirected + " for userID: " + req.session.user_id);
  console.log("urlDatabase:", urlDatabase);
  res.redirect('/urls/'+ redirected);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  user = userDatabase[req.session.user_id];
  let userSpecific = {};
  for (let shortURL in urlDatabase) {
    let value = urlDatabase[shortURL];
    if (value.userID === user.id) {
      userSpecific[shortURL] = value;
    };
  };
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL }
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {//post route which deletes saved URLs
  //console.log('Before Deletion: ', urlDatabase);
  user = userDatabase[req.session.user_id];
  if (!user) {
    res.status(401).send("Get out!")
    return;
  } let specificUrls = urlsForUser(urlDatabase, user.id);
    if (req.session.user_id === [req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  };
  //console.log('After Deletion: ', urlDatabase);
});

app.get("/url/:shortURL", (req, res) => {//post route to edit my url. go into database and change the longURL
  user = userDatabase[req.session.user_id];
  if (!user) {
    res.status(401).send("Get out!");
    return;
  }
  urlDatabase[req.params.shortURL] = req.params.body;//update
});

app.post("/urls/:shortURL", (req, res) => {//updating the longURL, assign it to the database at the reqparams 
  urlDatabase[req.params.shortURL].longURL = req.body.fname
  res.redirect("/urls");
});

app.get("/register", (req, res) => {//get route to register
  user = userDatabase[req.session.user_id]
  let templateVars = { user: userDatabase[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {//post method for register, Store the email and password into database
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please input an email and password!");
  } else  if (checkEmail(req.body.email)) {
    res.status(400).send("That email already exists!")
  } else {
  let userRandomId = generateRandomString();
  
    userDatabase[userRandomId] = {
    "id": userRandomId,
    "email": req.body.email,
    "password": bcrypt.hashSync(req.body.password, 10)
    };
  req.session.user_id = userRandomId
  res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {//get route to log in
  user = userDatabase[req.session.user_id]
  console.log("userDatabase: ", userDatabase);
  console.log("urlDatabase", urlDatabase)
  console.log("user is this one", user)
  console.log("cookies", req.session.user_id)
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {//post route to log in
  let existingUser = checkEmail(req.body.email);
  console.log("req.body.password:", req.body.password);
  
  if (!existingUser) {
    res.status(403).send("email doesn't exist!");
  } else if (!bcrypt.compareSync(req.body.password, userDatabase[existingUser].password )) {
    res.status(403).send("Password does not match!")
  } else {
    req.session.user_id =  getId(req.body.email)
    res.redirect("/urls");
  };
});

app.post("/logout", (req, res) => {
  req.session = null 
  res.redirect("/urls");
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log("You are connected to the server!")
});