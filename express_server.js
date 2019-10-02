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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("<h1>Hello! Welcome to the HomePage</h1>");
});

app.get("/urls", (req, res) => {
  console.log("cookies", req.cookies);
  let templateVars = {urls: urlDatabase, username: req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {//Adding a GET route to show the form. The order of route matters!! Go from most speficic to least
  res.render("urls_new");
});

app.post("/urls", (req, res) => {//.post is the method, "/urls" is the action
  let redirected = generateRandomString()
  urlDatabase[redirected] = req.body.longURL 
  console.log('shortURL has been created for ' + req.body.longURL +'\n' + redirected);
  res.redirect('/urls/'+ redirected)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {//post route which deletes 
  //console.log('Before Deletion: ', urlDatabase);
  delete urlDatabase[req.params.shortURL]
  //console.log('After Deletion: ', urlDatabase);
  res.redirect("/urls"); //redirect to urls
});

app.get("/url/:shortURL", (req, res) => {//post route to edit my url. go into database and change the longURL
  urlDatabase[req.params.shortURL] = req.params.body;//update
  console.log(urlDatabase)
});

app.post("/urls/:shortURL", (req, res) => {//updating the longURL, assign it to the database at the reqparams 
  urlDatabase[req.params.shortURL] = req.body.fname
  //console.log(urlDatabase);
  // console.log(req.body);
  // console.log(req.params);
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  console.log(req.body);
  let id = generateRandomString();
  usernameDatabase[id] = { "username": req.body.username }
  console.log(usernameDatabase);
  //console.log(usernameDatabase.id)
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  var torontoTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  torontoTime = new Date(torontoTime);
  let hour = torontoTime.getHours();
  let phrase = '';
  if (hour < 12) {
    phrase = 'Good morning';
  } else if (hour >= 12) {
    phrase = 'Good afternoon';
  } else if (hour >= 17) {
    phrase = 'Good evening';
  } else if (hour > 21) {
    phrase = "It's time to head home and rest";
  };

  let dayOfTheWeek = torontoTime.getDay();
  //console.log("Today's date: " + torontoTime.toLocaleString());
  //console.log(`${phrase} Ha, you are connected to the server at port ${PORT}.\nDon't forget your umbrella!`)
  console.log("You are connected to the server!")
});