const express = require('express')
const app = express()
const mysql = require('mysql');


const dbconn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:"",
    database:'eldomall'
})



app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false })) // express body parser

// app.use() - is used to execute a midleware function on all defined routes
app.get('/', 
function(req, res, next){
    console.log('this is a middleware')
    next();
}
, (req, res) => {
    res.render('home')
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
        (err, data) => {
            if(data.length > 0){
                if(pass === data[0].password){
                    // epress session middleware -- cookie

                    // bcrypt - - password encryption
                    
                    // res.render('home')
                    res.redirect("/")
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
                (err) =>{
                    if (err) console.log(err);
                    res.redirect('/login')
                })
            }
        }
    )
   
})

app.listen(3002, () => 
    console.log('No woman No cry')
);