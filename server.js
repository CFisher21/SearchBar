if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const PORT = 3000
const bcrypt = require('bcrypt')
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session')
const methodOverride = require('method-override')
const pgDal = require('./server/database/pg.dal')
const mDal = require('./server/database/mongo.dal')
const fs = require('fs')
const Fuse = require('fuse.js')
const initializePassport = require('./passport-config');

// this is for passport.js. it takes the data on file an assigns it to email and id so passport can use it
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id) 
)

const app = express()

const users = []
app.use(express.static('public'));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// these are the routes to navigate the webpage checkAuthenticated = needs to be logged in to see that specific page if not you will be redirected to the login page. Works in reverse too with checkNotAuthenticated you can't see those webpages if you are logged in.
app.get('/', (req, res) => {
    res.redirect('/register')
})

app.get('/login-after', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})

app.get('/mongo', checkAuthenticated, (req, res) => {
    res.render('mongo.ejs', { name: req.user.name })
})

app.get('/searchBoth', checkAuthenticated, (req, res) => {
    res.render('searchboth.ejs', { name: req.user.name })
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/login-after',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
    })
    res.redirect('/login')
    } catch {
    res.redirect('/register')
    }
})

// below are the search methods to search the databases
//postgres search
app.get('/search', checkAuthenticated, async (req, res) => {
    const search_term = req.query.search;
    let postgres_rows = await pgDal.getSearch(search_term)
    res.render('index.ejs', { name: req.user.name, postgres_rows})

    fs.readFile(__dirname + '/userLog.json', (error, data) => {

        let newData = {};

        newData.username = req.user.name;
        newData.email = req.user.email;
        newData.id = req.user.id;
        newData.password = req.user.password
        newData.searchterm = req.query.search

        if(error) {
            throw error
        } else {
            console.log('userLog.json file read sucessfully')
        }

        data = JSON.parse(data)

        data.push(newData)

        write = JSON.stringify(data, null, 2)

        fs.writeFile(__dirname + '/userLog.json', write, (error) => {
            if(error) throw error
            console.log('Data wrote to userLog.json')
        })

    })
})

// mongoDB search
app.get('/mongoSearch', checkAuthenticated, async (req, res) => {
    const search_term2 = req.query.search;
    let mongo_rows = await mDal.mongoSearch()

    const fuse = new Fuse(mongo_rows, {
        minMatchCharLength: 3,
        threshold: 0.3,
        distance: 1,
        includeScore: true,
        keys: [
            'first_name',
            'last_name',
            'email',
            'occupation'
        ]
    });
    
    const result = fuse.search(search_term2)
    res.render('mongo.ejs', {result})

    fs.readFile(__dirname + '/userLog.json', (error, data) => {

        let newData = {};

        newData.username = req.user.name;
        newData.email = req.user.email;
        newData.id = req.user.id;
        newData.password = req.user.password
        newData.searchterm = req.query.search

        if(error) {
            throw error
        } else {
            console.log('userLog.json file read sucessfully')
        }

        data = JSON.parse(data)

        data.push(newData)

        write = JSON.stringify(data, null, 2)

        fs.writeFile(__dirname + '/userLog.json', write, (error) => {
            if(error) throw error
            console.log('Data wrote to userLog.json')
        })

    })

})

// searches both databases at the same time
app.get('/searchBothResults', checkAuthenticated, async (req, res) => {
    const search_term3 = req.query.search;
    let pgrows = await pgDal.getSearch(search_term3)
    let mongo_rows = await mDal.mongoSearch()

    const fuse = new Fuse(mongo_rows, {
        minMatchCharLength: 3,
        threshold: 0.3,
        distance: 1,
        includeScore: true,
        keys: [
            'first_name',
            'last_name',
            'email',
            'occupation'
        ]
    });
    
    let moresult = fuse.search(search_term3)
    let mo_rows = []

    moresult.forEach(element => {
        mo_rows.push(element.item)
    });
    
    let both_rows = pgrows.concat(mo_rows)
   
    res.render('searchboth.ejs', {both_rows})
    

    fs.readFile(__dirname + '/userLog.json', (error, data) => {

        let newData = {};

        newData.username = req.user.name;
        newData.email = req.user.email;
        newData.id = req.user.id;
        newData.password = req.user.password
        newData.searchterm = req.query.search

        if(error) {
            throw error
        } else {
            console.log('userLog.json file read sucessfully')
        }

        data = JSON.parse(data)

        data.push(newData)

        write = JSON.stringify(data, null, 2)

        fs.writeFile(__dirname + '/userLog.json', write, (error) => {
            if(error) throw error
            console.log('Data wrote to userLog.json')
        })

    })
})

app.delete('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
    
})

// this function handles what traffic is allowed on what webpage
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } 
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
         return res.redirect('/login-after')
    }
    next()
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

