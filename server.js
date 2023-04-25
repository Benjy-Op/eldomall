const express = require('express')
const app = express()
const mysql = require('mysql');
const session = require('express-session')


const dbconn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:"",
    database:'eldomall'
})



app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        saveUninitialized: false,
}))

app.use((req, res, next) =>{
    if(req.session.isLoggedIn){
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user
    }else{
        res.locals.isLoggedIn = false;
    }
    next()
})

app.use(express.urlencoded({ extended: false })) // express body parser

// app.use() - is used to execute a midleware function on all defined routes
app.get('/',  (req, res) => {
    dbconn.query('SELECT * FROM products', (err, products) => {
        if (err) {
            res.render('home', {message: 'server error'})
        }
        if(products.length){
            console.log(products)
            res.render('home', {products: products})
        }else{
            res.render('home', {message: 'No products to display'})
        }
    })
});
app.get('/login', (req, res) => {
    res.render('login')
});
//get email and password 
// check if email is in db -- SELECT EMAIL, PASSWORD FROM users where email = ?
//compare emailin req.body vs email in resultsfrom ===

app.post('/login', (req, res) => {
    const mail = req.body.email
    const pass = req.body.password
    const sqly = 'SELECT * FROM users WHERE email = ?'
    dbconn.query(sqly, [mail],
        (err, user) => {
            if (err) {
                res.send('A problem occured')
            }
            if(user.length > 0){
                if(pass === user[0].password){
                    req.session.user = user[0]
                    req.session.isLoggedIn = true
                    res.redirect('/')
                    // epress session middleware -- cookie

                    // bcrypt - - password encryption
                    
                    // res.render('home')
                }else{
                    res.render('login', {
                        errorMessage: 'check email or password -- password is incorect'
                    })
                }
            }else{
                res.render('login', {
                    errorMessage: 'check email or password'
                })
            }
        }) 
})
// 

app.get('/signup', (req, res) => {
    res.render('signup')
});

app.post('/signup', (req, res) => {
    // check if email is already registered
    dbconn.query('SELECT * FROM users WHERE email = ?',
    [req.body.mail],
        (err, data) => {
            if(req.body.mail === data[0].email){
                res.render('signup', {
                    errorMessage: 'email already exists'
                })
            }
            else{
                dbconn.query('INSERT INTO users(id,fullName, email, phonenumber,location,password) VALUES (?,?,?,?,?,?)',
                [
                    req.body.id, 
                    req.body.fname,
                    req.body.mail, 
                    req.body.pnumber, 
                    req.body.location, 
                    req.body.password
                ],
                (err) => {
                    if (err) { 
                        res.send('a problem occured')
                    console.log(err);
                    }else{
                        res.redirect('/login')
                    }
                })
            }
        }
    )
   
})

app.get('/account', (req, res) => {
    if(req.session.isLoggedIn) {
        dbconn.query(
            `SELECT * FROM users WHERE email = '${req.session.user.email}'`,
            (err, result) => {
                if(err) {
                    res.send('a problem occured')
                }else{
                    res.render('account', { user: result[0] })
                }
            }
        )
        }else{
            res.redirect('/login')
        }
})

app.use((req, res, next) => {
    if (req.session) {
        res.locals.isLoggedIn = true
        res.locals.user = req.session.user
    }else{
        res.locals.isLoggedIn= false
    }
    next();
})

app.listen(3002, () => 
    console.log('No woman No cry')
);