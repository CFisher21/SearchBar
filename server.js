// Check if the NODE_ENV environment variable is not set to "production"
if (process.env.NODE_ENV !== "production") {
  // If the condition is true, load the dotenv package and execute its config method
  // This method will load environment variables from a .env file into the process environment
  // This is typically used in development environments to keep sensitive information (e.g. API keys, credentials) out of the codebase
  require("dotenv").config();
}

// Import the Express framework module
const express = require("express");
// Define a port number for the server to listen on
const PORT = 3000;
// Import the bcrypt library for password hashing and comparison
const bcrypt = require("bcrypt");
// Import the Passport library for user authentication
const passport = require("passport");
// Import the Express flash middleware for displaying flash messages
const flash = require("express-flash");
// Import the Express session middleware for user sessions
const session = require("express-session");
// Import the method-override middleware for using HTTP verbs other than GET and POST
const methodOverride = require("method-override");
// Import the PostgreSQL data access layer module
const pgDal = require("./server/database/pg.dal");
// Import the MongoDB data access layer module
const mDal = require("./server/database/mongo.dal");
// Import the Node.js file system module for reading and writing files
const fs = require("fs");
// Import the Fuse.js fuzzy search library for client-side search functionality
const Fuse = require("fuse.js");
// Import the initializePassport function for configuring Passport
const initializePassport = require("./passport-config");
// Import the users data from a JSON file
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


// Create an instance of the Express application
const app = express();
// Serve static files from the "public" directory
app.use(express.static(__dirname + "/public"));
// Set the view engine to EJS
app.set("view-engine", "ejs");
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: false }));
// Use the Express flash middleware for displaying flash messages
app.use(flash());
// Use the Express session middleware for user sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // A secret key used to sign the session ID cookie
    resave: false, // Whether to save the session if it hasn't been modified
    saveUninitialized: false, // Whether to create a new session if the user doesn't have one
  })
);
// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());
// Use the method-override middleware for using HTTP verbs other than GET and POST
app.use(methodOverride("_method"));

// These are the routes to navigate the webpage checkAuthenticated = needs to be logged in to see that specific page if not you will be redirected to the login page. Works in reverse too with checkNotAuthenticated you can't see those webpages if you are logged in.
// this is a redirect to send the user to the '/register' route if they don't enter anything into the url
app.get("/", (req, res) => {
  res.redirect("/register");
});
// Registration page, the user can enter details here to sign up an account
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
// Login in page where the user can put in the credentials they entered into the Registration page to log into the website
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});
// First page you see after you have a sucessful log in, this is the postgres search bar
app.get("/login-after", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});
// This page shows the mongoDB search bar
app.get("/mongo", checkAuthenticated, (req, res) => {
  res.render("mongo.ejs", { name: req.user.name });
});
// This page shows the combined postgres and mongoDB search bar
app.get("/searchBoth", checkAuthenticated, (req, res) => {
  res.render("searchboth.ejs", { name: req.user.name });
});
// This page shows the terms and conditions 
app.get("/terms", (req, res) => {
  res.render("terms.ejs");
})
// This page shows the privacy agreement
app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
})

// Handle POST requests to the "/login" route, this allows the user to login to the website
app.post(
  "/login",
  checkNotAuthenticated, // Middleware that checks if the user is not already authenticated
  passport.authenticate("local", { // Authenticate the user using the "local" strategy
    successRedirect: "/login-after", // If authentication succeeds, redirect to "/login-after"
    failureRedirect: "/login", // If authentication fails, redirect back to "/login"
    failureFlash: true, // Enable flash messages for authentication failures
  })
);
// Handle POST requests made on the '/register' route, this allows users to register an account
app.post("/register", checkNotAuthenticated, async (req, res) => {
   
  try{
    // Use bcrypt to hash the password so it can be saved securly
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Create and empty user variable 
    let user = {};
    // Take the data entered from the form on '/register' and add it to the user variable
    user.id = Date.now().toString(),
    user.name = req.body.name,
    user.email = req.body.email,
    user.password = hashedPassword;
    // Update the users variable required on line 46 so the info can be used to login
    users.push(user);
    // Read the data stored in 'users.json' 
    fs.readFile(__dirname + "/users.json", (error, data) => {
      // Handle errors
      if(error) throw error;
      // Parse the data object, JSON to JavaScript Object
      data = JSON.parse(data);
      // Push the 'user' data from above to the 'data' read and parsed from the 'users.json' file
      data.push(user);
      // Parse the data from JS object back to json so it can be saved
      write = JSON.stringify(data, null, 2);
        // Write everything above to the 'users.json' file
        fs.writeFile(__dirname + "/users.json", write, (error) => {
              // Handle errors
              if (error) throw error;
              // Write a message to the console to let the developer know it was sucessfully saved
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

// Below are the search methods to search the databases
// Postgres search
app.get("/search", checkAuthenticated, async (req, res) => {

  // Get the value that was entered into the search bar on the route '/login-after'
  const search_term = req.query.search;
  // Get the value from the drop down menu on '/login-after' 
  const search_by = req.query.searchby;
  // Pass the above variables to the pgDal so it can search using those terms
  let postgres_rows = await pgDal.getSearch(search_term, search_by);
  // Response to render the 'index.ejs' with the users name and the data queried from the postgres database
  res.render("index.ejs", { name: req.user.name, postgres_rows });
  // Write to 'userLog.json'
  writeUserlog(req, res);

});

// mongoDB search
app.get("/mongoSearch", checkAuthenticated, async (req, res) => {

  // Get the value that was entered into the search bar on the route '/mongo'
  const search_term2 = req.query.search;
  // Get the value from the drop down menu on '/mongo' 
  const search_by = req.query.searchby;
  // This queries the whole mongoDB database
  let mongo_rows = await mDal.mongoSearch();
  // This has code that fuse uses, it's used again at another point so we ship it to a function 
  useFuse(mongo_rows, search_by);
  // Uses fuse to create a fuzzy search
  const result = fuse.search(search_term2);
  // Renders the webpage with the results we got from fuse
  res.render("mongo.ejs", { name: req.user.name, result });
  // Writes the 'userLog.json' file
  writeUserlog(req, res);

});

// searches both databases at the same time
app.get("/searchBothResults", checkAuthenticated, async (req, res) => {

  // Get the value that was entered into the search bar on the route '/searchBoth'
  const search_term3 = req.query.search;
  // Get the value from the drop down menu on '/searchBoth' 
  const search_by = req.query.searchby;
  // Queries the postgres database
  let pgrows = await pgDal.getSearch(search_term3, search_by);
  // Gives us all the data from the mongoDB database
  let mongo_rows = await mDal.mongoSearch();
  // This has code that fuse uses
  useFuse(mongo_rows, search_by);
  // Uses fuse to create a fuzzy search for the mongoDB results
  let moresult = fuse.search(search_term3);
  // Empty array
  let mo_rows = [];
  // Destructures the result we get from fuse so that its the same format as the result we get from postgres database
  moresult.forEach((element) => {
    mo_rows.push(element.item);
  });
  // Adds the mongoDB and the postgres results together
  let both_rows = pgrows.concat(mo_rows);
  // Renders the webpage with the results we just searched for
  res.render("searchboth.ejs", { name: req.user.name, both_rows });
  // Writes the 'userLog.json' file
  writeUserlog(req, res);

});

// This allows you to logout of a passport session
app.delete("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Redirects you back to the login page
    res.redirect("/login");
  });
});

// Middleware function to check if client is authenticated
function checkAuthenticated(req, res, next) {
  // Check if the request object is authenticated
  if (req.isAuthenticated()) {
    // If authenticated, call the next middleware function in the stack
    return next();
  }
  // If not authenticated, redirect the client to the login page
  res.redirect("/login");
}


// Middleware function to check if client is not authenticated
function checkNotAuthenticated(req, res, next) {
  // Check if the request object is authenticated
  if (req.isAuthenticated()) {
    // If authenticated, redirect the client to the login-after page
    return res.redirect("/login-after");
  }
  // If not authenticated, call the next middleware function in the stack
  next();
}

// Put the below code into a function because it is used twice in the app
// Function to create a new Fuse object for searching data based on a given field
function useFuse(mongo_rows, search_by) {
  // Check which field to search by and create a new Fuse object with the specified keys
  if (search_by == "firstname") {
    fuse = new Fuse(mongo_rows, {
      minMatchCharLength: 3,  // Minimum character length to consider a match
      threshold: 0.3,  // Match threshold for considering a result to be a match
      distance: 1,  // Maximum edit distance for a match
      includeScore: true,  // Whether to include score in search results
      keys: ["first_name"],  // Keys to search for a match
    });
  } else if (search_by == "lastname") {
    fuse = new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["last_name"],
    });
  } else if (search_by == "email") {
    fuse = new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["email"],
    });
  } else {
    fuse = new Fuse(mongo_rows, {
      minMatchCharLength: 3,
      threshold: 0.3,
      distance: 1,
      includeScore: true,
      keys: ["occupation"],
    });
  }
}

// Put the below code into a function because it is used twice in the app
function writeUserlog(req, res) {

  // Read the 'userLog.json' file
  fs.readFile(__dirname + "/userLog.json", (error, data) => {
    // Create an empty array
    let newData = {};
    // Add data to the empty array
    // Add users name
    newData.username = req.user.name;
    // Add users email
    newData.email = req.user.email;
    // Add users ID
    newData.id = req.user.id;
    // Add users password
    newData.password = req.user.password;
    // Add users search term
    newData.searchterm = req.query.search;

    // Handle errors
    if (error) {
      throw error;
    } else {
      // Write to the console so the developer knows the file was read
      console.log("userLog.json file read sucessfully");
    }

    // Parse the data read from 'userLog.json' to a JS object, we do this because the data types in the file and 'newData' need to match
    data = JSON.parse(data);
    // Add the 'newData' to the data read from 'userLog.json'
    data.push(newData);
    // Parse the all the data into JSON so it can be saved
    write = JSON.stringify(data, null, 2);

    // Write the new data to the 'userLog.json' file
    fs.writeFile(__dirname + "/userLog.json", write, (error) => {

      // Handle errors
      if (error) throw error;
      // Write to the console so the developer knows the file was saved
      console.log("Data wrote to userLog.json");

    });
  });
}


// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message to the console indicating that the server is running and listening on the specified port
  console.log(`Server is running on ${PORT}`);
});