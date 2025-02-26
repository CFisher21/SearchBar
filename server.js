if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const PORT = 3000;
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const pgDal = require("./server/database/pg.dal");
const mDal = require("./server/database/mongo.dal");
const fs = require("fs");
const Fuse = require("fuse.js");
const initializePassport = require("./passport-config");
const users = require("./users.json");


// Call the initializePassport function, passing in:
// - The Passport library for user authentication
// - A function that finds a user by email in the users array
// - A function that finds a user by ID in the users array
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const app = express();
app.use(express.static(__dirname + "/public"));
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // A secret key used to sign the session ID cookie
    resave: false, // Whether to save the session if it hasn't been modified
    saveUninitialized: false, // Whether to create a new session if the user doesn't have one
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Use the method-override middleware for using HTTP verbs other than GET and POST
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/login-after", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/mongo", checkAuthenticated, (req, res) => {
  res.render("mongo.ejs", { name: req.user.name });
});

app.get("/searchBoth", checkAuthenticated, (req, res) => {
  res.render("searchboth.ejs", { name: req.user.name });
});

app.get("/terms", (req, res) => {
  res.render("terms.ejs");
})

app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
})


app.post(
  "/login",
  checkNotAuthenticated, 
  passport.authenticate("local", { 
    successRedirect: "/login-after", 
    failureRedirect: "/login", 
    failureFlash: true, 
  })
);
// Handle POST requests made on the '/register' route, this allows users to register an account
app.post("/register", checkNotAuthenticated, async (req, res) => {
   
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = {};
   
    user.id = Date.now().toString(),
    user.name = req.body.name,
    user.email = req.body.email,
    user.password = hashedPassword;
    
    users.push(user);
    
    fs.readFile(__dirname + "/users.json", (error, data) => {
     
      if(error) throw error;
      data = JSON.parse(data);
      data.push(user);
      write = JSON.stringify(data, null, 2);
        fs.writeFile(__dirname + "/users.json", write, (error) => {
              if (error) throw error;
              console.log("Data wrote to users.json");
            });
          });
      // If there was no errors redirect the user to the login page so they can login
      res.redirect("/login")
   } catch {
    // If there was an error the user will be redirected back to the '/register' route
    res.redirect('/register')
   }
});

// Postgres search
app.get("/search", checkAuthenticated, async (req, res) => {

  const search_term = req.query.search;
  const search_by = req.query.searchby;

  let postgres_rows = await pgDal.getSearch(search_term, search_by);

  res.render("index.ejs", { name: req.user.name, postgres_rows });

  writeUserlog(req, res);

});

// mongoDB search
app.get("/mongoSearch", checkAuthenticated, async (req, res) => {

  const search_term2 = req.query.search;
  const search_by = req.query.searchby;

  let mongo_rows = await mDal.mongoSearch();

  const fuse = useFuse(mongo_rows, search_by);
  const result = fuse.search(search_term2);
  
  res.render("mongo.ejs", { name: req.user.name, result });
  writeUserlog(req, res);

});

// searches both databases at the same time
app.get("/searchBothResults", checkAuthenticated, async (req, res) => {

  const search_term3 = req.query.search;
  const search_by = req.query.searchby;
  // Access databases
  let pgrows = await pgDal.getSearch(search_term3, search_by);
  let mongo_rows = await mDal.mongoSearch();
  // MongoDB fuzzy search
  const fuse = useFuse(mongo_rows, search_by);
  let moresult = fuse.search(search_term3);
  
  let mo_rows = [];
  moresult.forEach((element) => {
    mo_rows.push(element.item);
  });
  // Adds the mongoDB and the postgres results together
  let both_rows = pgrows.concat(mo_rows);
  
  res.render("searchboth.ejs", { name: req.user.name, both_rows });
  writeUserlog(req, res);

});

// This allows you to logout of a passport session
app.delete("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/login-after");
  }
  next();
}

function useFuse(mongo_rows, search_by) {
  if (search_by == "firstname") {
    return new Fuse(mongo_rows, {
      minMatchCharLength: 3,  // Minimum character length to consider a match
      threshold: 0.3,  // Match threshold for considering a result to be a match
      distance: 1,  // Maximum edit distance for a match
      includeScore: true,  // Whether to include score in search results
      keys: ["firstname"],  // Keys to search for a match
    });
  } else if (search_by == "lastname") {
    return new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["lastname"],
    });
  } else if (search_by == "email") {
    return new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["email"],
    });
  } else {
    return new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["occupation"],
    });
  }
}

function writeUserlog(req, res) {

  fs.readFile(__dirname + "/userLog.json", (error, data) => {
    let newData = {};
  
    newData.username = req.user.name;
    newData.email = req.user.email;
    newData.id = req.user.id;
    newData.password = req.user.password;
    newData.searchterm = req.query.search;

    if (error) {
      throw error;
    } else {
      console.log("userLog.json file read sucessfully");
    }

    data = JSON.parse(data);
    data.push(newData);
    write = JSON.stringify(data, null, 2);

    fs.writeFile(__dirname + "/userLog.json", write, (error) => {
      if (error) throw error;
      console.log("Data wrote to userLog.json");
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});