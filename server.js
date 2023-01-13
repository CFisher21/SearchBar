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
const bDal = require('./server/database/both.dal')
const fs = require('fs')
const Fuse = require('fuse.js')

const initializePassport = require('./passport-config');

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
    res.render('mongo.ejs')
})

app.get('/searchBoth', checkAuthenticated, (req, res) => {
    res.render('searchboth.ejs')
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

app.get('/mongoSearch', checkAuthenticated, async (req, res) => {
    const search_term2 = req.query.search;
    let mongo_rows = await mDal.mongoSearch()

    const fuse = new Fuse(mongo_rows, {
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

app.get('/searchBothResults', checkAuthenticated, async (req, res) => {
    const search_term3 = req.query.search;
    let both_rows = await bDal.bothSearch(search_term3)
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

