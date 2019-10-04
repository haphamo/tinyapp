const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
let cookieSession = require('cookie-session')
const {  generateRandomString,
  checkEmail,
  getId,
  urlsForUser} = require("./helper")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["mituot"]
}))

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
  } else {
    let specificUrls = urlsForUser(urlDatabase, user.id);
    if (req.session.user_id === [req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    }
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
  } else  if (checkEmail(req.body.email, userDatabase)) {
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
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {//post route to log in
  let existingUser = checkEmail((req.body.email), userDatabase);
  if (!existingUser) {
    res.status(403).send("email doesn't exist!");
  } else if (!bcrypt.compareSync(req.body.password, userDatabase[existingUser].password )) {
    res.status(403).send("Password does not match!")
  } else {
    req.session.user_id =  getId((req.body.email), userDatabase)
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