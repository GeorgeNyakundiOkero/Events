const router = require('express').Router();
const passport = require('passport');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Event= require('../models/Event');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, isAdmin } = require('../middleware/authenticate');
router.get('/', (req, res) => {
    res.render('home');
});
router.get('/admin', ensureAuthenticated,isAdmin,(req, res) => {
    User.find()
    .then( ausers => {
        res.render('admindashboard', {ausers});
    })
    .catch(err => {
        console.log(err);
    });
    
});
//user dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Event.find()
    .then(events => {
        res.render('userdashboard', {
            events
        });
    })
    .catch(err => {
        console.log(err);
    });
   
});

//render register view
router.get('/register', (req, res) => {
    res.render('register');
});


//user registration route
router.post('/register', (req, res) => {
    const { fullName, email, password, password2 } = req.body;
    let errors =[];

    //check fields
    if (!fullName || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all the fields'});
    }

    // check if password and password2 match
 if (password !== password2) {
    errors.push({msg: 'passwords do not match'});
}

   //check if password lenght meets minimum number of characters
   if(password.length < 6) {
       errors.push({msg: 'password should be at least six characters long'});
   }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            fullName,
            email,
            password,
            password2
        });
    } else{
        
        //pass validated data into the db
        //first check if user exists in the database
        User.findOne({email : email})
        .then(user => {
            if(user) {
                //user already exists
                errors.push({msg: 'User email is already registered.'});
                res.render('register', {
                    errors,
                    fullName,
                    email,
                    password,
                    password2
                });
            } else {
                // create a new user while encrypting the password
                const newUser = new User({
                    fullName,
                    email,
                    password
                });
                // Hash the password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    //set password to hashed value
                    newUser.password = hash;

                    //save the user and redirect the user to tthe login page
                    newUser.save()
                    .then( user => {
                        req.flash('success_msg','You are now registered');
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
                }));
            }
        });
    }
});


//render login view
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/logout',ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged out');
    res.redirect('/login');
});


//user login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

//create events route
router.get('/create', (req, res) => {
    res.render('createEvents');
});

//create events route
router.post('/create', (req, res) => {
    const { title,description, price, eventDate } = req.body;
    let errors = [];
    if( !title || !description || !price || !eventDate) {
        errors.push({msg: 'Please fill in all the fields'});
    }

    if(errors.length > 0){
        res.render('createEvents', {
            errors,
            title,
            description,
            price,
            eventDate
        });
    } else {
        const newEvent = new Event({
            title,
            description,
            price,
            eventDate
        });
        newEvent.save()
        .then(event => {
            req.flash('success_msg', 'Event Created Successfully');
            res.redirect('/dashboard');
        })
        .catch(err => {
            console.log(err);
        });
    }
    
});

//book events route
router.get('/book/:id', (req, res) => {
        const newbooking = new Booking({
            eventId: req.params.id,
            userId: req.user._id,
        });
        newbooking.save()
        .then(book => {
        res.redirect('/bookings');
    })
    .catch(err => {
        console.log(err);
    });
});



router.get('/bookings', (req, res) => {
    Booking.find({userId : req.user._id})
    .then(bookings => {
        res.render('bookings', {bookings});
    })
    .catch(err => {
        console.log(err);
    });
});


router.get('/admin/:id', (req, res, next) => {
    User.findById( req.params.id, (err, data) => {
        if(err) {
            console.log(err);
            return next(err);
        }
        data.isAdmin = true;
        data.save();
        return res.redirect('/admin');
    });

});
router.get('/remove/:id', (req, res, next) => {
    User.findById( req.params.id, (err, data) => {
        if(err) {
            console.log(err);
            return next(err);
        }
        data.isAdmin = false;
        data.save();
        return res.redirect('/admin');
    });

});
router.get('/delete/:id', (req, res, next) => {
    User.findById( req.params.id, (err, data) => {
        if(err) {
            console.log(err);
            return next(err);
        }
        data.remove();
        return res.redirect('/admin');
    });
});

router.get('/cancel/:id', (req, res, next) => {
    Booking.findById( req.params.id, (err, data) => {
        if(err) {
            console.log(err);
            return next(err);
        }
        data.remove();
        return res.redirect('/bookings');
    });
});

router.get('/view/:id', (req, res) => {
    Event.findOne({_id: req.params.id})
    .then(event => {
        res.render('receipts', {event});
    })
    .catch(err => {
        console.log(err);
    });

});


module.exports = router;