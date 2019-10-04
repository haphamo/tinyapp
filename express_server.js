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
  };
};

let urlsForUser = function(database, userID) {//function to filter urls for user specific
  let userSpecific = {};
  for (let shortURL in database) {
    console.log('eache url',shortURL);
    let value = database[shortURL];
    console.log('valueeeee', value)
    console.log('value.userid is', value.userID)
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

app.get("/urls", (req, res) => {
  //console.log("cookies", req.cookies);
  user = userDatabase[req.cookies["user_ID"]]
  if (!user) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
    return
  }
  let userSpecific = {};
  for (let shortURL in urlDatabase) {
    let value = urlDatabase[shortURL];
    if (value.userID === user.id) {
      userSpecific[shortURL] = value;
    }
  } 
  console.log("userSpecific", userSpecific);
  let templateVars = {urls: userSpecific,  user };
  console.log("req.cookies", req.cookies)
  console.log("The urlDatabase:" , urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {//Adding a GET route to show the form. The order of route matters!! Go from most speficic to least
  if (!req.cookies["user_ID"]) {//only logged in users can create links otherwise redirect
    res.redirect("/login");
  } else {
    user = userDatabase[req.cookies["user_ID"]]
    let templateVars = { user_ID: req.body.id , user };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let redirected = generateRandomString()
  urlDatabase[redirected] = { "longURL" : req.body.longURL , userID: req.cookies["user_ID"], "shortURL": redirected}
  console.log('shortURL has been created for ' + req.body.longURL +'\n' + redirected + " for userID: " + req.cookies["user_ID"]);
  console.log("urlDatabase:", urlDatabase);
  res.redirect('/urls/'+ redirected)
});

app.get("/u/:shortURL", (req, res) => {
  console.log("urlDatabase:", urlDatabase)
  console.log("req.cookies", req.cookies)
  console.log("GIVE ME SHORT URL", req.params.shortURL)
  user = userDatabase[req.cookies["user_ID"]]
  console.log('USERRRRRRR', user.id);
  let abc = urlsForUser(urlDatabase, user.id);
  console.log("abc", abc[req.params.shortURL].longURL)  
  res.redirect(abc[req.params.shortURL].longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  user = userDatabase[req.cookies["user_ID"]];
  let userSpecific = {};
  for (let shortURL in urlDatabase) {
    let value = urlDatabase[shortURL];
    if (value.userID === user.id) {
      userSpecific[shortURL] = value;
    }
  }  
 
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL }

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
  user = userDatabase[req.cookies["user_ID"]];
  if (!user) {
    res.status(401).send("Get out!")
    return
  } let specificUrls = urlsForUser(urlDatabase, user.id)
    if (req.cookies.userID === [req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls"); //redirect to urls

  }
  //console.log('After Deletion: ', urlDatabase);
});

app.get("/url/:shortURL", (req, res) => {//post route to edit my url. go into database and change the longURL
  urlDatabase[req.params.shortURL] = req.params.body;//update
});

app.post("/urls/:shortURL", (req, res) => {//updating the longURL, assign it to the database at the reqparams 
  urlDatabase[req.params.shortURL].longURL = req.body.fname
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