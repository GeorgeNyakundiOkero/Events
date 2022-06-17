module.exports = {
    ensureAuthenticated: function(req, res, next) {
            if(req.isAuthenticated()) {
                return next();
            }
            req.flash('error_msg', 'please log in to view this resource');
            res.redirect('/login');
    },
    isAdmin: function(req, res, next) {
        if(req.user.isAdmin){
            return next();
        }
        req.flash('error_msg', 'only admins can View this resource');
        res.redirect('/dashboard');
    }
}