const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
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
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {//Adding a GET route to show the form. The order of route matters!! Go from most speficic to least
  res.render("urls_new");
});

app.post("/urls", (req, res) => {//.post is the method, "/urls" is the action
  let redirected = generateRandomString()
  urlDatabase[redirected] = req.body.longURL 
  console.log('result', '/u/'+ redirected);
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
  console.log(`Today's date is Tuesday October 1, 2019.\n${phrase} Ha, you are connected to the server at port ${PORT}.`)
});