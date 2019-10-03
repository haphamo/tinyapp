const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//app.use(methodOverride) add middleware, it changes the request

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
    //console.log(userId);
    if (userDatabase[userId].email === email) {
      return true;
    };
  };
  return false;
};

checkPassword = function (password) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].password === password) {
      return true;
    }
  }
  return false;
};

getId = function (email) {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId].id
    };
  }
}

//Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged in user
let urlsForUser = function() {
  //go into database and search for the logged in user's key against the urlDatabase. for shortUrls in database if value
  
}

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"

};

const userDatabase = {
};

app.get("/", (req, res) => {
  res.send("<h1>Hello! Welcome to the HomePage</h1>");
});

app.get("/urls", (req, res) => {
  //console.log("cookies", req.cookies);
  if (!req.cookies["user_ID"]) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
  } else {
    user = userDatabase[req.cookies["user_ID"]]
    let templateVars = {urls: urlDatabase, user_ID: req.body.id };
    console.log("The urlDatabase:" , urlDatabase);
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {//Adding a GET route to show the form. The order of route matters!! Go from most speficic to least
  if (!req.cookies["user_ID"]) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
  } else {
    let templateVars = { user_ID: req.body.id  };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let redirected = generateRandomString()
  urlDatabase[redirected] = { "longURL" : req.body.longURL , userID: req.cookies["user_ID"]}
  console.log('shortURL has been created for ' + req.body.longURL +'\n' + redirected + " for userID: " + req.cookies["user_ID"]);
  console.log("URLDATABASE:", urlDatabase);
  console.log(Object.keys(urlDatabase))
  res.redirect('/urls/'+ redirected)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_ID: req.body.id };
  console.log("req.params.shortURL:", req.params.shortURL);
  console.log("urlDatabase[req.params.shortURL].longURL:", urlDatabase[req.params.shortURL].longURL)
  console.log("userDatabase[req.cookies['user_ID']]:", userDatabase[req.cookies["user_ID"]]);
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {//post route which deletes saved URLs
  //console.log('Before Deletion: ', urlDatabase);
  delete urlDatabase[req.params.shortURL]
  //console.log('After Deletion: ', urlDatabase);
  res.redirect("/urls"); //redirect to urls
});

app.get("/url/:shortURL", (req, res) => {//post route to edit my url. go into database and change the longURL
  urlDatabase[req.params.shortURL] = req.params.body;//update
  console.log("Line 124", urlDatabase)
});

app.post("/urls/:shortURL", (req, res) => {//updating the longURL, assign it to the database at the reqparams 
  urlDatabase[req.params.shortURL].longURL = req.body.fname
  console.log("urlDatabase: ", urlDatabase);
  //console.log(req.body);
  // console.log(req.params);
  res.redirect("/urls")
});

app.get("/register", (req, res) => {//get route to register
  user = userDatabase[req.cookies["user_ID"]]
  let templateVars = { user: userDatabase[req.cookies["user_ID"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {//post method for register, Store the email and password into database
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please input an email and password!");
  } else  if (checkEmail(req.body.email)) {
    res.status(400).send("That email already exists!")
  } else {
  let userRandomId = generateRandomString();
    userDatabase[userRandomId] = {//user_id cookie containing the user's newly generated ID
    "id": userRandomId,
    "email": req.body.email,
    "password": req.body.password
    };
  res.cookie("user_ID", userRandomId)
  console.log("this is the userDatabase", userDatabase);
  res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {//get route to log in
  user = userDatabase[req.cookies["user_ID"]]
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {//post route to log in
  user = userDatabase[req.cookies["user_ID"]]
  let templateVars = { user: userDatabase[req.cookies["user_ID"]] };
  if (!checkEmail(req.body.email)) {
    res.status(403).send("email doesn't exist!")
  } else if (checkPassword(req.body.password) === false) {
    res.status(403).send("Password does not match!")
  } else {
    res.cookie("user_ID", getId(req.body.email))
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {//clearing cookie after logout, redirect to all pages as a new user
  res.clearCookie("user_ID");
  //console.log("cookies", req.cookies)
  res.redirect("/urls");
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  //console.log("Today's date: " + torontoTime.toLocaleString());
  //console.log(`${phrase} Ha, you are connected to the server at port ${PORT}.\nDon't forget your umbrella!`)
  console.log("You are connected to the server!")
});