// Import the necessary modules
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

// Define a function that initializes the passport configuration
function initialize (passport, getUserByEmail, getUserById) {

    // Define a function that authenticates a user based on their email and password
    const authenticateUser = async (email, password, done) => {
        // Get the user with the specified email
        const user = getUserByEmail(email)
        if(user == null) {
            // If there is no user with the specified email, call the 'done' function with an error and a message
            return done(null, false, {message: 'No user with that email'})
        }
        try {
            // Compare the specified password with the user's password using bcrypt
            if(await bcrypt.compare(password, user.password)) {
                // If the passwords match, call the 'done' function with no error and the authenticated user object
                return done(null, user)
            } else {
                // If the passwords don't match, call the 'done' function with no error and a message
                return done(null, false, {message: 'Password incorrect'}) 
            }
        } catch (e) {
            // If an error occurs, call the 'done' function with the error
            return done(e)
        }
    }

    // Configure the local authentication strategy using the 'authenticateUser' function and the specified options
    passport.use(new LocalStrategy ({ usernameField: 'email'}, authenticateUser))

    // Serialize the user object to a unique identifier and call the 'done' function
    passport.serializeUser((user, done) => done(null, user.id))

    // Deserialize the user object from a unique identifier and call the 'done' function
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

// Export the 'initialize' function for use in other modules
module.exports = initialize
