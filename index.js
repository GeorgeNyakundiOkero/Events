require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const indexR= require('./routes/index');
const flash = require('connect-flash');
const  session = require('express-session');
const passport = require('passport');


//initializing the application
const app = express();

require('./middleware/passport')(passport);

//get environment variables
const PORT = process.env.PORT;
const DB = process.env.DB;

//setting up static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: false}));

//setting up the view engine
app.set('view engine', 'ejs');

//set the main layout
app.use(expressLayouts);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  //passport middleware
 app.use(passport.initialize());
 app.use(passport.session());

  //connect flash
  app.use(flash());


//connect to the database
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if(err) throw err;
    console.log('Database Connected');
});

//hadling of messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//making the user accessible from any route
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', indexR);

app.listen(PORT, (err) => {
    if(err) {
        console.log(err);
    }
    console.log(`Application server started On Port: ${PORT}`)
});

